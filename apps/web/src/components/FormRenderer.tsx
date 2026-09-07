import { Check, Download, Plus, Power, Trash2, UploadCloud } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import type { RcFile } from "antd/es/upload";
import { Button, Checkbox, DatePicker, Input, InputNumber, Select, Tabs, Upload } from "antd";
import type { UploadProps } from "antd";
import dayjs from "dayjs";
import type { ApiClient, FieldDefinition, RuntimeModel, RuntimeView, ViewNode } from "./types";
import { getDisplayField } from "./fieldHelpers";

const relationModelCache = new Map<string, RuntimeModel>();
const relationOptionsCache = new Map<string, Array<{ id: number; label: string }>>();

type Props = {
  api: ApiClient;
  model: RuntimeModel;
  view: RuntimeView;
  record: Record<string, unknown> | null;
  onSaved: (id: number) => void;
  onRegistryChanged: () => void;
  onOpenRecord: (actionExternalId: string, id: number, label?: string) => void;
};

export type FormRendererHandle = {
  save: () => Promise<void>;
};

const FormRenderer = forwardRef<FormRendererHandle, Props>(function FormRenderer({ api, model, view, record, onSaved, onRegistryChanged, onOpenRecord }, ref) {
  const [values, setValues] = useState<Record<string, unknown>>(() => record ?? {});
  useEffect(() => setValues(record ?? {}), [record]);

  async function save() {
    if (record?.id) {
      await api("/api/model/write", { method: "POST", body: { model: model.technicalName, ids: [record.id], values } });
      onSaved(Number(record.id));
      return;
    }
    const created = await api<{ id: number }>("/api/model/create", { method: "POST", body: { model: model.technicalName, values } });
    onSaved(created.id);
  }
  useImperativeHandle(ref, () => ({ save }), [record, values, model.technicalName]);

  async function call(method: string) {
    if (!record?.id) return;
    await api("/api/model/call", { method: "POST", body: { model: model.technicalName, method, ids: [record.id] } });
    onSaved(Number(record.id));
  }
  async function createQuotation() {
    if (!record?.id) return;
    const result = await api<{ quotations?: number[] }>("/api/model/call", { method: "POST", body: { model: model.technicalName, method: "create_quotation", ids: [record.id] } });
    const quotationId = result.quotations?.[0];
    if (quotationId) {
      onOpenRecord("sale.action_orders", quotationId, String(record.name ?? "Opportunity"));
      return;
    }
    onSaved(Number(record.id));
  }
  async function moduleAction(path: string) {
    if (!record?.technical_name) return;
    await api(path, { method: "POST", body: { module: String(record.technical_name) } });
    onRegistryChanged();
  }

  return <section className="form-panel">
    <div className="form-commandbar">
      <div className="form-toolbar">
        {["sale.order", "purchase.order"].includes(model.technicalName) && record?.id ? <Button icon={<Check size={17} />} onClick={() => call("confirm")}>Confirm</Button> : null}
        {model.technicalName === "stock.move" && record?.id ? <Button icon={<Check size={17} />} onClick={() => call("done")}>Mark Done</Button> : null}
        {model.technicalName === "crm.lead" && record?.id && record.type === "lead" ? <Button icon={<Check size={17} />} onClick={() => call("convert")}>Chuyển đổi</Button> : null}
        {model.technicalName === "crm.lead" && record?.id ? <Button icon={<Plus size={17} />} onClick={createQuotation}>Create Quotation</Button> : null}
        {model.technicalName === "crm.lead" && record?.id && record.state !== "won" ? <Button icon={<Check size={17} />} onClick={() => call("won")}>Won</Button> : null}
        {model.technicalName === "crm.lead" && record?.id && record.state !== "lost" ? <Button danger onClick={() => call("lost")}>Lost</Button> : null}
        {model.technicalName === "crm.lead" && record?.id && record.state === "lost" ? <Button onClick={() => call("restore")}>Khôi phục</Button> : null}
        {model.technicalName === "crm.activity" && record?.id && record.state !== "done" ? <Button icon={<Check size={17} />} onClick={() => call("done")}>Mark Done</Button> : null}
        {model.technicalName === "crm.activity" && record?.id && record.state !== "cancelled" ? <Button danger onClick={() => call("cancel")}>Hủy</Button> : null}
        {model.technicalName === "core.module" && record?.state !== "INSTALLED" ? <Button icon={<Download size={17} />} onClick={() => moduleAction("/api/modules/install")}>Settings</Button> : null}
        {model.technicalName === "core.module" && record?.state === "INSTALLED" ? <Button icon={<UploadCloud size={17} />} onClick={() => moduleAction("/api/modules/upgrade")}>Nâng cấp</Button> : null}
        {model.technicalName === "core.module" && record?.state === "INSTALLED" && record?.technical_name !== "base" ? <Button danger icon={<Power size={17} />} onClick={() => moduleAction("/api/modules/uninstall")}>Gỡ cài đặt</Button> : null}
      </div>
      <StateBar model={model} values={values} />
    </div>
    <ViewNodeRenderer api={api} node={view.architecture} model={model} values={values} parentId={record?.id ? Number(record.id) : null} onUploaded={onSaved} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
  </section>;
});

export default FormRenderer;

function StateBar({ model, values }: { model: RuntimeModel; values: Record<string, unknown> }) {
  const field = model.fields.find((candidate) => ["state", "status"].includes(candidate.name) && candidate.type === "selection");
  if (!field) return null;
  const current = String(values[field.name] ?? field.defaultValue ?? "");
  const options = field.selectionOptions?.length ? field.selectionOptions : current ? [{ label: current, value: current }] : [];
  return <div className="statusbar">{options.map((option) => <span key={option.value} className={option.value === current ? "active" : undefined}>{option.label}</span>)}</div>;
}

function ViewNodeRenderer({ api, node, model, values, parentId, onUploaded, onChange }: { api: ApiClient; node: ViewNode; model: RuntimeModel; values: Record<string, unknown>; parentId: number | null; onUploaded: (id: number) => void; onChange: (name: string, value: unknown) => void }) {
  if (node.type === "form") return <>{node.children.map((child, index) => <ViewNodeRenderer key={index} api={api} node={child} model={model} values={values} parentId={parentId} onUploaded={onUploaded} onChange={onChange} />)}</>;
  if (node.type === "group") return <div className="field-grid">{node.children.map((child, index) => <ViewNodeRenderer key={index} api={api} node={child} model={model} values={values} parentId={parentId} onUploaded={onUploaded} onChange={onChange} />)}</div>;
  if (node.type === "notebook") return <NotebookRenderer api={api} node={node} model={model} values={values} parentId={parentId} onUploaded={onUploaded} onChange={onChange} />;
  if (node.type === "page") return <>{node.children.map((child, index) => <ViewNodeRenderer key={index} api={api} node={child} model={model} values={values} parentId={parentId} onUploaded={onUploaded} onChange={onChange} />)}</>;
  if (node.type !== "field") return null;
  const field = model.fields.find((candidate) => candidate.name === node.name);
  if (field && ["state", "status"].includes(field.name) && field.type === "selection") return null;
  return field ? <FieldRenderer api={api} model={model} field={field} value={values[field.name]} values={values} parentId={parentId} onUploaded={onUploaded} onChange={(value) => onChange(field.name, value)} onBulkChange={(nextValues) => Object.entries(nextValues).forEach(([name, nextValue]) => onChange(name, nextValue))} /> : null;
}

function NotebookRenderer({ api, node, model, values, parentId, onUploaded, onChange }: { api: ApiClient; node: Extract<ViewNode, { type: "notebook" }>; model: RuntimeModel; values: Record<string, unknown>; parentId: number | null; onUploaded: (id: number) => void; onChange: (name: string, value: unknown) => void }) {
  const pages = node.children.filter((child): child is Extract<ViewNode, { type: "page" }> => child.type === "page");
  const [activeKey, setActivityKey] = useState("0");
  useEffect(() => setActivityKey("0"), [node]);
  const activeIndex = Math.min(Number(activeKey) || 0, Math.max(pages.length - 1, 0));
  const activePage = pages[activeIndex];
  if (!activePage) return null;
  return <div className="form-tabs">
    <Tabs activeKey={String(activeIndex)} onChange={setActivityKey} items={pages.map((page, index) => ({ key: String(index), label: page.label }))} />
    <div className="form-tab-panel">
      <ViewNodeRenderer api={api} node={activePage} model={model} values={values} parentId={parentId} onUploaded={onUploaded} onChange={onChange} />
    </div>
  </div>;
}

function FieldRenderer({ api, model, field, value, values, parentId, onUploaded, onChange, onBulkChange }: { api: ApiClient; model: RuntimeModel; field: FieldDefinition; value: unknown; values: Record<string, unknown>; parentId: number | null; onUploaded: (id: number) => void; onChange: (value: unknown) => void; onBulkChange: (values: Record<string, unknown>) => void }) {
  if (field.type === "one2many") return <OneToManyRenderer api={api} field={field} parentId={parentId} />;
  if (model.technicalName === "ir.attachment" && field.name === "datas") return <AttachmentUploadField api={api} value={value} values={values} onUploaded={onUploaded} onChange={onChange} onBulkChange={onBulkChange} />;
  if (field.name === "url" && field.readonly) return <label className="field"><span>{field.label}</span>{value ? <a className="field-link" href={String(value)} target="_blank" rel="noreferrer">{String(value)}</a> : <Input readOnly value="" />}</label>;
  return <label className="field"><span className={field.required ? "required" : undefined}>{field.label}</span>
    {field.type === "text" && <Input.TextArea value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} readOnly={field.readonly} />}
    {field.type === "boolean" && <Checkbox checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} disabled={field.readonly} />}
    {field.type === "date" && <DatePicker value={dateValue(value)} onChange={(_, dateString) => onChange(Array.isArray(dateString) ? dateString[0] : dateString)} disabled={field.readonly} />}
    {field.type === "datetime" && <DatePicker showTime value={dateValue(value)} onChange={(_, dateString) => onChange(Array.isArray(dateString) ? dateString[0] : dateString)} disabled={field.readonly} />}
    {field.type === "selection" && <Select value={String(value ?? field.defaultValue ?? "")} onChange={onChange} options={(field.selectionOptions ?? []).map((option) => ({ label: option.label, value: option.value }))} disabled={field.readonly} />}
    {field.type === "many2one" && <ManyToOneInput api={api} field={field} value={value} onChange={onChange} />}
    {field.type === "char" && <Input type={field.name === "password" ? "password" : "text"} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} readOnly={field.readonly} />}
    {["integer", "decimal"].includes(field.type) && <InputNumber value={numberValue(value)} onChange={(nextValue) => onChange(nextValue ?? 0)} readOnly={field.readonly} />}
    {field.type === "json" && <Input value={typeof value === "string" ? value : JSON.stringify(value ?? "")} onChange={(event) => onChange(event.target.value)} readOnly={field.readonly} />}
  </label>;
}

function AttachmentUploadField({ api, value, values, onUploaded, onChange, onBulkChange }: { api: ApiClient; value: unknown; values: Record<string, unknown>; onUploaded: (id: number) => void; onChange: (value: unknown) => void; onBulkChange: (values: Record<string, unknown>) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileName = String(values.file_name || values.name || "");
  const uploadProps: UploadProps = {
    accept: "*",
    beforeUpload: async (file) => {
      setUploading(true);
      try {
        const data = new FormData();
        data.append("file", file as RcFile);
        if (values.name) data.append("name", String(values.name));
        if (values.res_model) data.append("res_model", String(values.res_model));
        if (values.res_id) data.append("res_id", String(values.res_id));
        const result = await api<{ id: number; bucket: string; object_name: string; file_size: number; checksum: string }>("/api/attachments/upload", { method: "POST", body: data });
        onBulkChange({
          id: result.id,
          datas: "",
          name: values.name || file.name,
          file_name: file.name,
          mime_type: file.type || "application/octet-stream",
          file_size: result.file_size,
          checksum: result.checksum,
          storage: "minio",
          bucket: result.bucket,
          object_name: result.object_name
        });
        onUploaded(result.id);
      } finally {
        setUploading(false);
      }
      return Upload.LIST_IGNORE;
    },
    maxCount: 1,
    showUploadList: false
  };
  return <label className="field attachment-upload-field">
    <span>Upload File</span>
    <div className="attachment-upload-control">
      <Upload {...uploadProps}>
        <Button icon={<UploadCloud size={15} />} loading={uploading}>Choose File</Button>
      </Upload>
      <Input.TextArea value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} placeholder="Ô nhập base64 cũ tùy chọn. File lớn sẽ tải trực tiếp lên MinIO khi chọn ở trên." />
      {fileName ? <small>{fileName}</small> : null}
    </div>
  </label>;
}

function OneToManyRenderer({ api, field, parentId }: { api: ApiClient; field: FieldDefinition; parentId: number | null }) {
  const [relatedModel, setRelatedModel] = useState<RuntimeModel | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const columns = useMemo(() => relatedModel?.fields.filter((candidate) => isLineColumn(candidate, field.inverseField)) ?? [], [field.inverseField, relatedModel]);
  useEffect(() => { if (field.relationModel) api<RuntimeModel>(`/api/model/${field.relationModel}/metadata`).then(setRelatedModel); }, [api, field.relationModel]);
  useEffect(() => { loadRows(); }, [field.relationModel, field.inverseField, parentId, columns]);
  async function loadRows() { if (!field.relationModel || !field.inverseField || !parentId || !relatedModel || columns.length === 0) { setRows([]); return; } const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: field.relationModel, domain: [[field.inverseField, "=", parentId]], fields: columns.map((column) => column.name) } }); setRows(data.records); }
  async function addRow() { if (!field.relationModel || !field.inverseField || !parentId || !relatedModel) return; const values: Record<string, unknown> = { [field.inverseField]: parentId }; columns.forEach((column) => { if (column.defaultValue !== undefined && column.defaultValue !== null) values[column.name] = column.defaultValue; }); await api("/api/model/create", { method: "POST", body: { model: field.relationModel, values } }); await loadRows(); }
  async function updateRow(row: Record<string, unknown>, name: string, value: unknown) {
    if (!field.relationModel) return;
    const nextRow = { ...row, [name]: value };
    const values: Record<string, unknown> = { [name]: value };
    if (name === "quantity" || name === "price_unit") {
      nextRow.price_subtotal = Number(nextRow.quantity ?? 0) * Number(nextRow.price_unit ?? 0);
      values.price_subtotal = nextRow.price_subtotal;
    }
    setRows((current) => current.map((candidate) => candidate.id === row.id ? nextRow : candidate));
    await api("/api/model/write", { method: "POST", body: { model: field.relationModel, ids: [Number(row.id)], values } });
    await loadRows();
  }
  async function removeRow(row: Record<string, unknown>) { if (!field.relationModel) return; await api("/api/model/unlink", { method: "POST", body: { model: field.relationModel, ids: [Number(row.id)] } }); await loadRows(); }
  return <div className="one2many"><div className="one2many-header"><span>{field.label}</span><Button type="text" icon={<Plus size={16} />} onClick={addRow} disabled={!parentId}>Thêm</Button></div>{!parentId ? <div className="one2many-empty">Save the parent record before adding lines.</div> : <table><thead><tr>{columns.map((column) => <th key={column.name} className={`line-col line-col-${column.name}`}>{column.label}</th>)}<th className="row-action" /></tr></thead><tbody>{rows.map((row) => <tr key={String(row.id)}>{columns.map((column) => <td key={column.name} className={`line-col line-col-${column.name}`}><InlineField api={api} field={column} value={row[column.name]} onChange={(value) => updateRow(row, column.name, value)} /></td>)}<td className="row-action"><Button type="text" danger icon={<Trash2 size={15} />} onClick={() => removeRow(row)} /></td></tr>)}</tbody></table>}{parentId && rows.length === 0 ? <div className="one2many-empty">Chưa có dòng</div> : null}</div>;
}

function InlineField({ api, field, value, onChange }: { api: ApiClient; field: FieldDefinition; value: unknown; onChange: (value: unknown) => void }) {
  if (field.type === "boolean") return <Checkbox checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} disabled={field.readonly} />;
  if (field.type === "many2one") return <ManyToOneInput api={api} field={field} value={value} onChange={onChange} compact />;
  if (field.type === "selection") return <Select value={String(value ?? field.defaultValue ?? "")} onChange={onChange} options={(field.selectionOptions ?? []).map((option) => ({ label: option.label, value: option.value }))} disabled={field.readonly} />;
  if (field.type === "date") return <DatePicker value={dateValue(value)} onChange={(_, dateString) => onChange(Array.isArray(dateString) ? dateString[0] : dateString)} disabled={field.readonly} />;
  if (field.type === "datetime") return <DatePicker showTime value={dateValue(value)} onChange={(_, dateString) => onChange(Array.isArray(dateString) ? dateString[0] : dateString)} disabled={field.readonly} />;
  if (["integer", "decimal"].includes(field.type)) return <InputNumber value={numberValue(value)} onChange={(nextValue) => onChange(nextValue ?? 0)} readOnly={field.readonly} />;
  if (field.type === "text") return <Input.TextArea value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} readOnly={field.readonly} />;
  return <Input type={field.name === "password" ? "password" : "text"} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} readOnly={field.readonly} />;
}

function ManyToOneInput({ api, field, value, onChange, compact = false }: { api: ApiClient; field: FieldDefinition; value: unknown; onChange: (value: unknown) => void; compact?: boolean }) {
  const [options, setOptions] = useState<Array<{ id: number; label: string }>>([]);
  useEffect(() => {
    if (!field.relationModel) return;
    setOptions(relationOptionsCache.get(optionCacheKey(field.relationModel, "")) ?? []);
  }, [field.relationModel]);
  async function loadOptions(searchText: string) {
    if (!field.relationModel) return setOptions([]);
    const cacheKey = optionCacheKey(field.relationModel, searchText);
    const cached = relationOptionsCache.get(cacheKey);
    if (cached) return setOptions(cached);
    const relatedModel = await getRelationModel(api, field.relationModel);
    const displayField = getDisplayField(relatedModel);
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: field.relationModel, domain: searchText.trim() ? [[displayField, "ilike", searchText.trim()]] : [], fields: [displayField], limit: 8 } });
    const loaded = data.records.map((record) => ({ id: Number(record.id), label: displayLabel(record[displayField]) || String(record.id) }));
    relationOptionsCache.set(cacheKey, loaded);
    setOptions(loaded);
  }
  const selectedId = relationId(value);
  const selectedLabel = relationLabel(value);
  const selectOptions = selectedId && selectedLabel && !options.some((option) => option.id === Number(selectedId)) ? [{ id: Number(selectedId), label: selectedLabel }, ...options] : options;
  return <Select className={compact ? "many2one-picker compact" : "many2one-picker"} value={selectedId == null || selectedId === "" ? undefined : Number(selectedId)} showSearch allowClear placeholder="Search..." filterOption={false} onSearch={loadOptions} onFocus={() => loadOptions("")} onClear={() => onChange(null)} onChange={(nextValue) => onChange(nextValue ?? null)} options={selectOptions.map((option) => ({ label: option.label, value: option.id }))} disabled={field.readonly} />;
}

async function getRelationModel(api: ApiClient, relationModel: string) {
  const cached = relationModelCache.get(relationModel);
  if (cached) return cached;
  const loaded = await api<RuntimeModel>(`/api/model/${relationModel}/metadata`);
  relationModelCache.set(relationModel, loaded);
  return loaded;
}

function optionCacheKey(relationModel: string, searchText: string) {
  return `${relationModel}:${searchText.trim().toLowerCase()}`;
}

function dateValue(value: unknown) {
  if (!value) return null;
  const parsed = dayjs(String(value));
  return parsed.isValid() ? parsed : null;
}

function numberValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}


function relationId(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function relationLabel(value: unknown) {
  return Array.isArray(value) && value[1] !== undefined && value[1] !== null ? String(value[1]) : "";
}

function displayLabel(value: unknown) {
  if (Array.isArray(value)) return value[1] === undefined || value[1] === null ? "" : String(value[1]);
  return value === undefined || value === null ? "" : String(value);
}

function isLineColumn(field: FieldDefinition, inverseField?: string) {
  return field.name !== inverseField && field.stored !== false && !isAuditField(field);
}

function isAuditField(field: FieldDefinition) {
  return ["create_uid", "write_uid", "create_date", "write_date"].includes(field.name) || (field.readonly && (field.sequence ?? 0) >= 900);
}

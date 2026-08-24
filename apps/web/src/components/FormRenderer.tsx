import { Check, Download, Plus, Power, RefreshCw, Save, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "antd";
import type { ApiClient, FieldDefinition, RuntimeModel, RuntimeView, ViewNode } from "./types";
import { getDisplayField } from "./fieldHelpers";

type Props = { api: ApiClient; model: RuntimeModel; view: RuntimeView; record: Record<string, unknown> | null; onSaved: (id: number) => void; onRefresh: (id: number) => void; onDeleted: () => void; onRegistryChanged: () => void };

export default function FormRenderer({ api, model, view, record, onSaved, onRefresh, onDeleted, onRegistryChanged }: Props) {
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
  async function remove() {
    if (!record?.id) return;
    await api("/api/model/unlink", { method: "POST", body: { model: model.technicalName, ids: [record.id] } });
    onDeleted();
  }
  async function call(method: string) {
    if (!record?.id) return;
    await api("/api/model/call", { method: "POST", body: { model: model.technicalName, method, ids: [record.id] } });
    onSaved(Number(record.id));
  }
  async function moduleAction(path: string) {
    if (!record?.technical_name) return;
    await api(path, { method: "POST", body: { module: String(record.technical_name) } });
    onRegistryChanged();
  }

  return <section className="form-panel">
    <div className="form-toolbar">
      <Button type="primary" icon={<Save size={17} />} onClick={save}>Save</Button>
      {record?.id ? <Button icon={<RefreshCw size={17} />} onClick={() => onRefresh(Number(record.id))}>Refresh</Button> : null}
      {model.technicalName === "sale.order" && record?.id ? <Button icon={<Check size={17} />} onClick={() => call("confirm")}>Confirm</Button> : null}
      {model.technicalName === "core.module" && record?.state !== "INSTALLED" ? <Button icon={<Download size={17} />} onClick={() => moduleAction("/api/modules/install")}>Install</Button> : null}
      {model.technicalName === "core.module" && record?.state === "INSTALLED" ? <Button icon={<UploadCloud size={17} />} onClick={() => moduleAction("/api/modules/upgrade")}>Upgrade</Button> : null}
      {model.technicalName === "core.module" && record?.state === "INSTALLED" && record?.technical_name !== "base" ? <Button danger icon={<Power size={17} />} onClick={() => moduleAction("/api/modules/uninstall")}>Uninstall</Button> : null}
      {record?.id ? <Button danger icon={<Trash2 size={17} />} onClick={remove}>Delete</Button> : null}
    </div>
    <ViewNodeRenderer api={api} node={view.architecture} model={model} values={values} parentId={record?.id ? Number(record.id) : null} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
  </section>;
}

function ViewNodeRenderer({ api, node, model, values, parentId, onChange }: { api: ApiClient; node: ViewNode; model: RuntimeModel; values: Record<string, unknown>; parentId: number | null; onChange: (name: string, value: unknown) => void }) {
  if (node.type === "form") return <>{node.children.map((child, index) => <ViewNodeRenderer key={index} api={api} node={child} model={model} values={values} parentId={parentId} onChange={onChange} />)}</>;
  if (node.type === "group") return <div className="field-grid">{node.children.map((child, index) => <ViewNodeRenderer key={index} api={api} node={child} model={model} values={values} parentId={parentId} onChange={onChange} />)}</div>;
  if (node.type !== "field") return null;
  const field = model.fields.find((candidate) => candidate.name === node.name);
  return field ? <FieldRenderer api={api} field={field} value={values[field.name]} parentId={parentId} onChange={(value) => onChange(field.name, value)} /> : null;
}

function FieldRenderer({ api, field, value, parentId, onChange }: { api: ApiClient; field: FieldDefinition; value: unknown; parentId: number | null; onChange: (value: unknown) => void }) {
  if (field.type === "one2many") return <OneToManyRenderer api={api} field={field} parentId={parentId} />;
  if (field.name === "url" && field.readonly) return <label className="field"><span>{field.label}</span>{value ? <a className="field-link" href={String(value)} target="_blank" rel="noreferrer">{String(value)}</a> : <input readOnly value="" />}</label>;
  return <label className="field"><span className={field.required ? "required" : undefined}>{field.label}</span>
    {field.type === "text" && <textarea value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />}
    {field.type === "boolean" && <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />}
    {field.type === "date" && <input type="date" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />}
    {field.type === "selection" && <select value={String(value ?? field.defaultValue ?? "")} onChange={(event) => onChange(event.target.value)}>{(field.selectionOptions ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>}
    {field.type === "many2one" && <ManyToOneInput api={api} field={field} value={value} onChange={onChange} />}
    {["char", "integer", "decimal", "json"].includes(field.type) && <input type={field.name === "password" ? "password" : field.type === "integer" || field.type === "decimal" ? "number" : "text"} value={String(value ?? "")} onChange={(event) => onChange(["integer", "decimal"].includes(field.type) ? Number(event.target.value) : event.target.value)} readOnly={field.readonly} />}
  </label>;
}

function OneToManyRenderer({ api, field, parentId }: { api: ApiClient; field: FieldDefinition; parentId: number | null }) {
  const [relatedModel, setRelatedModel] = useState<RuntimeModel | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const columns = useMemo(() => relatedModel?.fields.filter((candidate) => candidate.name !== field.inverseField && candidate.stored !== false) ?? [], [field.inverseField, relatedModel]);
  useEffect(() => { if (field.relationModel) api<RuntimeModel>(`/api/model/${field.relationModel}/metadata`).then(setRelatedModel); }, [api, field.relationModel]);
  useEffect(() => { loadRows(); }, [field.relationModel, field.inverseField, parentId]);
  async function loadRows() { if (!field.relationModel || !field.inverseField || !parentId) { setRows([]); return; } const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: field.relationModel, domain: [[field.inverseField, "=", parentId]], fields: columns.map((column) => column.name) } }); setRows(data.records); }
  async function addRow() { if (!field.relationModel || !field.inverseField || !parentId || !relatedModel) return; const values: Record<string, unknown> = { [field.inverseField]: parentId }; columns.forEach((column) => { if (column.defaultValue !== undefined && column.defaultValue !== null) values[column.name] = column.defaultValue; }); await api("/api/model/create", { method: "POST", body: { model: field.relationModel, values } }); await loadRows(); }
  async function updateRow(row: Record<string, unknown>, name: string, value: unknown) { if (!field.relationModel) return; const nextRow = { ...row, [name]: value }; if (name === "quantity" || name === "price_unit") nextRow.price_subtotal = Number(nextRow.quantity ?? 0) * Number(nextRow.price_unit ?? 0); setRows((current) => current.map((candidate) => candidate.id === row.id ? nextRow : candidate)); await api("/api/model/write", { method: "POST", body: { model: field.relationModel, ids: [Number(row.id)], values: nextRow } }); await loadRows(); }
  async function removeRow(row: Record<string, unknown>) { if (!field.relationModel) return; await api("/api/model/unlink", { method: "POST", body: { model: field.relationModel, ids: [Number(row.id)] } }); await loadRows(); }
  return <div className="one2many"><div className="one2many-header"><span>{field.label}</span><Button type="text" icon={<Plus size={16} />} onClick={addRow} disabled={!parentId}>Add</Button></div>{!parentId ? <div className="one2many-empty">Save the parent record before adding lines.</div> : <table><thead><tr>{columns.map((column) => <th key={column.name}>{column.label}</th>)}<th className="row-action" /></tr></thead><tbody>{rows.map((row) => <tr key={String(row.id)}>{columns.map((column) => <td key={column.name}><InlineField api={api} field={column} value={row[column.name]} onChange={(value) => updateRow(row, column.name, value)} /></td>)}<td className="row-action"><Button type="text" danger icon={<Trash2 size={15} />} onClick={() => removeRow(row)} /></td></tr>)}</tbody></table>}{parentId && rows.length === 0 ? <div className="one2many-empty">No lines</div> : null}</div>;
}

function InlineField({ api, field, value, onChange }: { api: ApiClient; field: FieldDefinition; value: unknown; onChange: (value: unknown) => void }) {
  if (field.type === "boolean") return <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />;
  if (field.type === "many2one") return <ManyToOneInput api={api} field={field} value={value} onChange={onChange} compact />;
  if (field.type === "selection") return <select value={String(value ?? field.defaultValue ?? "")} onChange={(event) => onChange(event.target.value)}>{(field.selectionOptions ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  return <input type={["integer", "decimal"].includes(field.type) ? "number" : "text"} value={String(value ?? "")} onChange={(event) => onChange(["integer", "decimal"].includes(field.type) ? Number(event.target.value) : event.target.value)} readOnly={field.readonly} />;
}

function ManyToOneInput({ api, field, value, onChange, compact = false }: { api: ApiClient; field: FieldDefinition; value: unknown; onChange: (value: unknown) => void; compact?: boolean }) {
  const [options, setOptions] = useState<Array<{ id: number; label: string }>>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => { loadSelectedLabel(); }, [api, field.relationModel, value]);
  useEffect(() => { if (open) loadOptions(query); }, [open, query, api, field.relationModel]);
  async function loadOptions(searchText: string) { if (!field.relationModel) return setOptions([]); const relatedModel = await api<RuntimeModel>(`/api/model/${field.relationModel}/metadata`); const displayField = getDisplayField(relatedModel); const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: field.relationModel, domain: searchText.trim() ? [[displayField, "ilike", searchText.trim()]] : [], fields: [displayField], limit: 8 } }); setOptions(data.records.map((record) => ({ id: Number(record.id), label: String(record[displayField] ?? record.id) }))); }
  async function loadSelectedLabel() { if (!field.relationModel || value == null || value === "") return setQuery(""); const relatedModel = await api<RuntimeModel>(`/api/model/${field.relationModel}/metadata`); const displayField = getDisplayField(relatedModel); const data = await api<{ records: Record<string, unknown>[] }>("/api/model/read", { method: "POST", body: { model: field.relationModel, ids: [Number(value)], fields: [displayField] } }); setQuery(String(data.records[0]?.[displayField] ?? value)); }
  return <div className={compact ? "many2one-picker compact" : "many2one-picker"}><input value={query} onBlur={() => window.setTimeout(() => setOpen(false), 120)} onChange={(event) => { setQuery(event.target.value); setOpen(true); if (!event.target.value) onChange(null); }} onFocus={() => setOpen(true)} placeholder="Search..." readOnly={field.readonly} />{open && !field.readonly ? <div className="many2one-options">{options.map((option) => <button type="button" key={option.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(option.id); setQuery(option.label); setOpen(false); }}>{option.label}</button>)}{options.length === 0 ? <div className="many2one-empty">No records</div> : null}</div> : null}</div>;
}

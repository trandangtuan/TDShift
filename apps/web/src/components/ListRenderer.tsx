import { Empty, Input, Pagination, Select, Space, Table } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Domain, DomainTerm, FieldDefinition } from "@record-platform/core";
import type { ApiClient, RuntimeModel, RuntimeView } from "./types";
import { fieldLabel, formatValue } from "./fieldHelpers";

type ListRendererProps = {
  api: ApiClient;
  model: RuntimeModel;
  view: RuntimeView;
  records: Record<string, unknown>[];
  page: number;
  pageSize: number;
  onOpen: (id: number) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onFilterChange: (domain: Domain) => void;
};

export default function ListRenderer({ api, model, view, records, page, pageSize, onOpen, onPageChange, onPageSizeChange, onFilterChange }: ListRendererProps) {
  const fields = view.architecture.type === "list" ? view.architecture.fields : [];
  const [filters, setFilters] = useState<Record<string, string>>({});
  const domain = useMemo(() => buildColumnDomain(model, fields, filters), [model, fields, filters]);
  const domainKey = JSON.stringify(domain);
  const listKey = `${model.technicalName}:${view.technicalName}`;
  const onFilterChangeRef = useRef(onFilterChange);
  const didMountRef = useRef(false);
  const skipNextFilterChangeRef = useRef(false);

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  useEffect(() => {
    if (Object.values(filters).some(Boolean)) {
      skipNextFilterChangeRef.current = true;
      setFilters({});
    }
  }, [listKey]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      skipNextFilterChangeRef.current = false;
      return;
    }
    if (skipNextFilterChangeRef.current) {
      skipNextFilterChangeRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => onFilterChangeRef.current(domain), 300);
    return () => window.clearTimeout(timer);
  }, [domainKey]);

  const columns = fields.map((fieldName) => {
    const field = model.fields.find((candidate) => candidate.name === fieldName);
    const searchable = Boolean(field && field.stored !== false && field.type !== "one2many");
    return {
    title: (
      <div className="column-header">
        <span>{fieldLabel(model, fieldName)}</span>
        {searchable ? (
          <Input
            size="small"
            value={filters[fieldName] ?? ""}
            onChange={(event) => setFilters((current) => ({ ...current, [fieldName]: event.target.value }))}
            onClick={(event) => event.stopPropagation()}
            placeholder="Tìm kiếm"
          />
        ) : null}
      </div>
    ),
    dataIndex: fieldName,
    key: fieldName,
    render: (value: unknown, record: Record<string, unknown>) => formatValue(model, fieldName, value || record[fieldName], api)
  };
  });
  return <section className="panel list-panel">
    <Table columns={columns} dataSource={records} rowKey={(record) => String(record.id)} pagination={false} scroll={{ x: "max-content", y: "calc(100vh - 238px)" }} locale={{ emptyText: <Empty description="Không có bản ghi" /> }} onRow={(record) => ({ onClick: () => onOpen(Number(record.id)), className: "clickable-row" })} />
    <Space className="pager" align="center"><span>Page {page + 1}</span><Pagination current={page + 1} pageSize={pageSize} total={(page + 1) * pageSize + (records.length === pageSize ? 1 : 0)} showSizeChanger={false} onChange={(nextPage) => onPageChange(nextPage - 1)} /><Select value={pageSize} options={[10, 30, 50, 100].map((size) => ({ value: size, label: `${size} dòng` }))} onChange={onPageSizeChange} /></Space>
  </section>;
}

function buildColumnDomain(model: RuntimeModel, fields: string[], filters: Record<string, string>): Domain {
  const terms: DomainTerm[] = [];
  for (const fieldName of fields) {
    const field = model.fields.find((candidate) => candidate.name === fieldName);
    const rawValue = filters[fieldName]?.trim();
    if (!field || field.stored === false || !rawValue || field.type === "one2many") continue;
    const term = filterTerm(field, rawValue);
    if (term) terms.push(term);
  }
  return terms;
}

function filterTerm(field: FieldDefinition, rawValue: string): DomainTerm | null {
  if (field.type === "integer" || field.type === "many2one") {
    const value = Number(rawValue);
    return Number.isFinite(value) ? [field.name, "=", value] : null;
  }
  if (field.type === "decimal") {
    const value = Number(rawValue);
    return Number.isFinite(value) ? [field.name, "=", value] : null;
  }
  if (field.type === "boolean") {
    const normalized = rawValue.toLowerCase();
    if (["true", "yes", "1", "y"].includes(normalized)) return [field.name, "=", true];
    if (["false", "no", "0", "n"].includes(normalized)) return [field.name, "=", false];
    return null;
  }
  return [field.name, "ilike", rawValue];
}

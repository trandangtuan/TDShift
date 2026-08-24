import { Empty, Pagination, Select, Space, Table } from "antd";
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
};

export default function ListRenderer({ api, model, view, records, page, pageSize, onOpen, onPageChange, onPageSizeChange }: ListRendererProps) {
  const fields = view.architecture.type === "list" ? view.architecture.fields : [];
  const columns = fields.map((fieldName) => ({
    title: fieldLabel(model, fieldName),
    dataIndex: fieldName,
    key: fieldName,
    render: (value: unknown, record: Record<string, unknown>) => formatValue(model, fieldName, value || record[fieldName], api)
  }));
  return <section className="panel">
    <Table columns={columns} dataSource={records} rowKey={(record) => String(record.id)} pagination={false} locale={{ emptyText: <Empty description="No records" /> }} onRow={(record) => ({ onClick: () => onOpen(Number(record.id)), className: "clickable-row" })} />
    <Space className="pager" align="center"><span>Page {page + 1}</span><Pagination current={page + 1} pageSize={pageSize} total={(page + 1) * pageSize + (records.length === pageSize ? 1 : 0)} showSizeChanger={false} onChange={(nextPage) => onPageChange(nextPage - 1)} /><Select value={pageSize} options={[10, 30, 50, 100].map((size) => ({ value: size, label: `${size} rows` }))} onChange={onPageSizeChange} /></Space>
  </section>;
}

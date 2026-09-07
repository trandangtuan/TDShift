import { useEffect, useState } from "react";
import { Alert, Button, Input, Popconfirm, Space } from "antd";
import { ArrowLeft, Database, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { ApiClient } from "./types";

type DatabaseManagerProps = { api: ApiClient; onClose: () => void };
type DatabaseOption = { name: string; isDefault: boolean };

export default function DatabaseManager({ api, onClose }: DatabaseManagerProps) {
  const [databases, setDatabases] = useState<DatabaseOption[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function reload() {
    setDatabases(await api<DatabaseOption[]>("/api/databases"));
  }

  useEffect(() => { reload().catch(() => setError("Không thể tải cơ sở dữ liệu.")); }, [api]);

  async function create() {
    setLoading(true);
    setError("");
    try { await api("/api/databases", { method: "POST", body: { name } }); setName(""); await reload(); }
    catch { setError("Không thể tạo cơ sở dữ liệu."); }
    finally { setLoading(false); }
  }

  async function remove(database: string) {
    setError("");
    try { await api(`/api/databases/${encodeURIComponent(database)}`, { method: "DELETE" }); await reload(); }
    catch { setError("Không thể xóa cơ sở dữ liệu."); }
  }

  return <section className="database-screen">
    <div className="database-screen-header">
      <div>
        <span className="eyebrow">Quản trị hệ thống</span>
        <h1><Database size={24} /> Database management</h1>
        <p>Create isolated workspaces and choose one at the next login.</p>
      </div>
      <Button icon={<ArrowLeft size={16} />} onClick={onClose}>Quay lại workspace</Button>
    </div>
    <div className="database-create-panel">
      <div><strong>Create database</strong><span>Dùng 2-50 chữ thường, số, _ hoặc -.</span></div>
      <Space.Compact>
        <Input aria-label="Database name" placeholder="vd: cong_ty_a" value={name} onChange={(event) => setName(event.target.value)} onPressEnter={create} />
        <Button type="primary" icon={<Plus size={16} />} loading={loading} onClick={create}>Create</Button>
      </Space.Compact>
    </div>
    {error ? <Alert type="error" showIcon message={error} /> : null}
    <div className="database-list-header"><strong>Database khả dụng</strong><Button type="text" icon={<RefreshCw size={16} />} onClick={() => reload()} title="Làm mới cơ sở dữ liệu" /></div>
    <div className="database-grid">{databases.map((database) => <article className="database-card" key={database.name}>
      <div className="database-card-icon"><Database size={20} /></div>
      <div className="database-card-content"><strong>{database.name}</strong><span>{database.isDefault ? "Database default" : "Database tách biệt"}</span></div>
      {!database.isDefault ? <Popconfirm title="Delete this database?" description="Tất cả bản ghi trong cơ sở dữ liệu này sẽ bị xóa." onConfirm={() => remove(database.name)}><Button danger type="text" icon={<Trash2 size={16} />} title={`Delete ${database.name}`} /></Popconfirm> : <span className="database-default-badge">Default</span>}
    </article>)}</div>
  </section>;
}
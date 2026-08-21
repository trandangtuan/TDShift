import { Check, ChevronDown, Download, List, LogOut, Plus, Power, RefreshCw, Save, Search, Settings, ShoppingCart, Trash2, UploadCloud, Users } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { ActionDefinition, FieldDefinition, RuntimeMenu, RuntimeView, ViewNode } from "@record-platform/core";
import "./index.css";

const apiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:3100";
const tokenStorageKey = "record-platform-token";
let authToken = localStorage.getItem(tokenStorageKey);

type RuntimeModel = {
  technicalName: string;
  name: string;
  tableName: string;
  fields: FieldDefinition[];
};

type Mode = "list" | "form";
type AuthUser = { id: number; login?: string; name: string };

export default function App() {
  const [token, setToken] = useState<string | null>(() => authToken);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [menus, setMenus] = useState<RuntimeMenu[]>([]);
  const [action, setAction] = useState<ActionDefinition | null>(null);
  const [model, setModel] = useState<RuntimeModel | null>(null);
  const [view, setView] = useState<RuntimeView | null>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("list");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  useEffect(() => {
    authToken = token;
    if (token) localStorage.setItem(tokenStorageKey, token);
    else localStorage.removeItem(tokenStorageKey);
  }, [token]);

  useEffect(() => {
    const onExpired = () => handleLogout(false);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  useEffect(() => {
    if (!token) {
      setAuthChecked(true);
      return;
    }
    bootstrapSession();
  }, [token]);

  async function bootstrapSession() {
    try {
      const session = await api<{ user: AuthUser }>("/api/auth/me");
      setUser(session.user);
      await reloadMenus();
    } catch {
      handleLogout(false);
    } finally {
      setAuthChecked(true);
    }
  }

  function handleLogin(nextToken: string, nextUser: AuthUser) {
    setToken(nextToken);
    setUser(nextUser);
    setAuthChecked(false);
  }

  async function handleLogout(callServer = true) {
    if (callServer && token) {
      try {
        await api("/api/auth/logout", { method: "POST" });
      } catch {
        // Local logout is enough because the token is stored client-side.
      }
    }
    setToken(null);
    setUser(null);
    setMenus([]);
    setAction(null);
    setModel(null);
    setView(null);
    setRecords([]);
    setSelectedId(null);
    setMode("list");
    setAuthChecked(true);
  }

  async function reloadMenus() {
    setMenus(await api<RuntimeMenu[]>("/api/ui/menus"));
  }

  async function openAction(externalId: string) {
    const nextAction = await api<ActionDefinition>(`/api/ui/actions/${externalId}`);
    if (!nextAction.model) return;
    const [nextModel, nextView] = await Promise.all([
      api<RuntimeModel>(`/api/model/${nextAction.model}/metadata`),
      api<RuntimeView>(`/api/ui/views?model=${nextAction.model}&type=list`)
    ]);
    setAction(nextAction);
    setModel(nextModel);
    setView(nextView);
    setMode("list");
    setSelectedId(null);
    setPage(0);
    await loadRecords(nextAction.model, nextView, nextModel, 0, pageSize);
  }

  async function loadRecords(modelName = action?.model, activeView = view, activeModel = model, activePage = page, activePageSize = pageSize) {
    if (!modelName || !activeView) return;
    const searchField = activeModel?.fields.find((field) => field.name === "name")?.name ?? activeModel?.fields.find((field) => field.name === "technical_name")?.name;
    const fields = activeView.architecture.type === "list" ? activeView.architecture.fields : undefined;
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: modelName, domain: query && searchField ? [[searchField, "ilike", query]] : [], fields, limit: activePageSize, offset: activePage * activePageSize } });
    setRecords(data.records);
  }

  async function openForm(id: number | null) {
    if (!action?.model) return;
    const nextView = await api<RuntimeView>(`/api/ui/views?model=${action.model}&type=form`);
    setView(nextView);
    setSelectedId(id);
    setMode("form");
  }

  async function backToList() {
    if (!action?.model) return;
    const nextView = await api<RuntimeView>(`/api/ui/views?model=${action.model}&type=list`);
    setView(nextView);
    setMode("list");
    setSelectedId(null);
    await loadRecords(action.model, nextView);
  }

  const selectedRecord = useMemo(() => records.find((record) => record.id === selectedId) ?? null, [records, selectedId]);

  async function stayOnFormAfterSave(id: number) {
    if (!action?.model || !view) return;
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/read", { method: "POST", body: { model: action.model, ids: [id] } });
    const savedRecord = data.records[0];
    if (!savedRecord) return;
    setRecords((current) => {
      const exists = current.some((record) => record.id === id);
      return exists ? current.map((record) => (record.id === id ? savedRecord : record)) : [savedRecord, ...current];
    });
    setSelectedId(id);
    setMode("form");
  }

  if (!authChecked) {
    return <div className="auth-loading">Loading session...</div>;
  }

  if (!token || !user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-menu">
          <MenuTree menus={menus} onOpen={openAction} />
        </div>
        <div className="sidebar-user">
          <div>
            <span>{user.name}</span>
            {user.login ? <small>{user.login}</small> : null}
          </div>
          <button className="icon-button" title="Logout" onClick={() => handleLogout()}><LogOut size={17} /></button>
        </div>
      </aside>
      <main className="workspace">
        {!action || !model || !view ? (
          <div className="empty-state">
            <Settings size={36} />
            <h1>Metadata runtime is ready</h1>
            <p>Choose a menu record. The sidebar, action, view, fields, and records are all resolved from runtime metadata.</p>
          </div>
        ) : (
          <>
            <div className="actionbar">
              <div>
                <h1>{action.name}</h1>
                <span>{model.technicalName}</span>
              </div>
              <div className="actions">
                {mode === "list" ? (
                  <>
                    <div className="searchbox">
                      <Search size={16} />
                      <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setPage(0);
                          loadRecords(action.model, view, model, 0, pageSize);
                        }
                      }} placeholder="Search name" />
                    </div>
                    <button onClick={() => {
                      setPage(0);
                      loadRecords(action.model, view, model, 0, pageSize);
                    }} title="Search"><Search size={17} /></button>
                    <button onClick={() => loadRecords(action.model, view, model, page, pageSize)} title="Refresh list"><RefreshCw size={17} /></button>
                    <button onClick={() => openForm(null)} title="Create"><Plus size={17} /></button>
                  </>
                ) : (
                  <button onClick={backToList} title="Back to list"><List size={17} /></button>
                )}
              </div>
            </div>
            {mode === "list" ? (
              <ListRenderer
                model={model}
                view={view}
                records={records}
                page={page}
                pageSize={pageSize}
                onOpen={openForm}
                onPageChange={async (nextPage) => {
                  setPage(nextPage);
                  await loadRecords(action.model, view, model, nextPage, pageSize);
                }}
                onPageSizeChange={async (nextPageSize) => {
                  setPageSize(nextPageSize);
                  setPage(0);
                  await loadRecords(action.model, view, model, 0, nextPageSize);
                }}
              />
            ) : (
              <FormRenderer
                model={model}
                view={view}
                record={selectedRecord}
                onSaved={stayOnFormAfterSave}
                onRefresh={stayOnFormAfterSave}
                onDeleted={backToList}
                onRegistryChanged={async () => {
                  await reloadMenus();
                  await backToList();
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (token: string, user: AuthUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [login, setLogin] = useState("admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const body = mode === "login" ? { login, password } : { login, name, email, password };
      const result = await api<{ token: string; user: AuthUser }>(mode === "login" ? "/api/auth/login" : "/api/auth/register", { method: "POST", body });
      onLogin(result.token, result.user);
    } catch {
      setError(mode === "login" ? "Invalid login or password." : "Could not create account. Check the values or use another login.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={submit}>
        <div>
          <h1>Record Platform</h1>
          <p>{mode === "login" ? "Sign in to continue." : "Create an account to start working."}</p>
        </div>
        <div className="auth-switch">
          <button type="button" className={mode === "login" ? "active" : undefined} onClick={() => {
            setMode("login");
            setLogin("admin");
            setPassword("admin");
            setError("");
          }}>Login</button>
          <button type="button" className={mode === "register" ? "active" : undefined} onClick={() => {
            setMode("register");
            setLogin("");
            setPassword("");
            setError("");
          }}>Register</button>
        </div>
        <label>
          <span>Login</span>
          <input value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" />
        </label>
        {mode === "register" ? (
          <>
            <label>
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </label>
          </>
        ) : null}
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        {error ? <div className="login-error">{error}</div> : null}
        <button type="submit" disabled={submitting}>{submitting ? "Please wait..." : mode === "login" ? "Login" : "Register"}</button>
      </form>
    </main>
  );
}

function MenuTree({ menus, onOpen }: { menus: RuntimeMenu[]; onOpen: (action: string) => void }) {
  return <nav>{menus.map((menu) => <MenuNode key={menu.technicalName} menu={menu} onOpen={onOpen} level={0} />)}</nav>;
}

function MenuNode({ menu, onOpen, level }: { menu: RuntimeMenu; onOpen: (action: string) => void; level: number }) {
  const [open, setOpen] = useState(false);
  const Icon = menu.icon === "shopping-cart" ? ShoppingCart : menu.icon === "users" ? Users : Settings;
  return (
    <div>
      <button className="menu-item" style={{ paddingLeft: 14 + level * 14 }} onClick={() => (menu.action ? onOpen(menu.action) : setOpen(!open))}>
        {level === 0 && <Icon size={17} />}
        <span>{menu.name}</span>
        {menu.children.length > 0 && <ChevronDown className={open ? "chevron open" : "chevron"} size={15} />}
      </button>
      {open && menu.children.map((child) => <MenuNode key={child.technicalName} menu={child} onOpen={onOpen} level={level + 1} />)}
    </div>
  );
}

function ListRenderer({
  model,
  view,
  records,
  page,
  pageSize,
  onOpen,
  onPageChange,
  onPageSizeChange
}: {
  model: RuntimeModel;
  view: RuntimeView;
  records: Record<string, unknown>[];
  page: number;
  pageSize: number;
  onOpen: (id: number) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const fields = view.architecture.type === "list" ? view.architecture.fields : [];
  return (
    <section className="panel">
      <table>
        <thead>
          <tr>{fields.map((fieldName) => <th key={fieldName}>{fieldLabel(model, fieldName)}</th>)}</tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              className="clickable-row"
              key={String(record.id)}
              onClick={() => onOpen(Number(record.id))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onOpen(Number(record.id));
              }}
              tabIndex={0}
            >
              {fields.map((fieldName) => <td key={fieldName}>{formatValue(model, fieldName, record[fieldName])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {records.length === 0 && <div className="table-empty">No records</div>}
      <div className="pager">
        <button disabled={page === 0} onClick={() => onPageChange(Math.max(0, page - 1))}>Previous</button>
        <span>Page {page + 1}</span>
        <button disabled={records.length < pageSize} onClick={() => onPageChange(page + 1)}>Next</button>
        <label>
          Rows
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            {[10, 30, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}

function FormRenderer({
  model,
  view,
  record,
  onSaved,
  onRefresh,
  onDeleted,
  onRegistryChanged
}: {
  model: RuntimeModel;
  view: RuntimeView;
  record: Record<string, unknown> | null;
  onSaved: (id: number) => void;
  onRefresh: (id: number) => void;
  onDeleted: () => void;
  onRegistryChanged: () => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => record ?? {});

  useEffect(() => {
    setValues(record ?? {});
  }, [record]);

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

  async function installModule() {
    if (!record?.technical_name) return;
    await api("/api/modules/install", { method: "POST", body: { module: String(record.technical_name) } });
    onRegistryChanged();
  }

  async function uninstallModule() {
    if (!record?.technical_name) return;
    await api("/api/modules/uninstall", { method: "POST", body: { module: String(record.technical_name) } });
    onRegistryChanged();
  }

  async function upgradeModule() {
    if (!record?.technical_name) return;
    await api("/api/modules/upgrade", { method: "POST", body: { module: String(record.technical_name) } });
    onRegistryChanged();
  }

  return (
    <section className="form-panel">
      <div className="form-toolbar">
        <button onClick={save}><Save size={17} />Save</button>
        {record?.id ? <button onClick={() => onRefresh(Number(record.id))}><RefreshCw size={17} />Refresh</button> : null}
        {model.technicalName === "sale.order" && record?.id ? <button onClick={() => call("confirm")}><Check size={17} />Confirm</button> : null}
        {model.technicalName === "core.module" && record?.state !== "INSTALLED" ? <button onClick={installModule}><Download size={17} />Install</button> : null}
        {model.technicalName === "core.module" && record?.state === "INSTALLED" ? <button onClick={upgradeModule}><UploadCloud size={17} />Upgrade</button> : null}
        {model.technicalName === "core.module" && record?.state === "INSTALLED" && record?.technical_name !== "base" ? <button className="danger" onClick={uninstallModule}><Power size={17} />Uninstall</button> : null}
        {record?.id ? <button className="danger" onClick={remove}><Trash2 size={17} />Delete</button> : null}
      </div>
      <ViewNodeRenderer node={view.architecture} model={model} values={values} parentId={record?.id ? Number(record.id) : null} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
    </section>
  );
}

function ViewNodeRenderer({
  node,
  model,
  values,
  parentId,
  onChange
}: {
  node: ViewNode;
  model: RuntimeModel;
  values: Record<string, unknown>;
  parentId: number | null;
  onChange: (name: string, value: unknown) => void;
}) {
  if (node.type === "form") return <>{node.children.map((child, index) => <ViewNodeRenderer key={index} node={child} model={model} values={values} parentId={parentId} onChange={onChange} />)}</>;
  if (node.type === "group") return <div className="field-grid">{node.children.map((child, index) => <ViewNodeRenderer key={index} node={child} model={model} values={values} parentId={parentId} onChange={onChange} />)}</div>;
  if (node.type !== "field") return null;
  const field = model.fields.find((candidate) => candidate.name === node.name);
  if (!field) return null;
  return <FieldRenderer field={field} value={values[field.name]} parentId={parentId} onChange={(value) => onChange(field.name, value)} />;
}

function FieldRenderer({ field, value, parentId, onChange }: { field: FieldDefinition; value: unknown; parentId: number | null; onChange: (value: unknown) => void }) {
  if (field.type === "one2many") {
    return <OneToManyRenderer field={field} parentId={parentId} />;
  }
  return (
    <label className="field">
      <span className={field.required ? "required" : undefined}>{field.label}</span>
      {field.type === "text" && <textarea value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />}
      {field.type === "boolean" && <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />}
      {field.type === "date" && <input type="date" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />}
      {field.type === "selection" && (
        <select value={String(value ?? field.defaultValue ?? "")} onChange={(event) => onChange(event.target.value)}>
          {(field.selectionOptions ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      )}
      {field.type === "many2one" && <ManyToOneInput field={field} value={value} onChange={onChange} />}
      {["char", "integer", "decimal", "json"].includes(field.type) && (
        <input
          type={field.name === "password" ? "password" : field.type === "integer" || field.type === "decimal" ? "number" : "text"}
          value={String(value ?? "")}
          onChange={(event) => onChange(field.type === "integer" ? Number(event.target.value) : field.type === "decimal" ? Number(event.target.value) : event.target.value)}
          readOnly={field.readonly}
        />
      )}
    </label>
  );
}

function OneToManyRenderer({ field, parentId }: { field: FieldDefinition; parentId: number | null }) {
  const [relatedModel, setRelatedModel] = useState<RuntimeModel | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const columns = useMemo(() => relatedModel?.fields.filter((candidate) => candidate.name !== field.inverseField && candidate.stored !== false) ?? [], [field.inverseField, relatedModel]);

  useEffect(() => {
    if (!field.relationModel) return;
    api<RuntimeModel>(`/api/model/${field.relationModel}/metadata`).then(setRelatedModel);
  }, [field.relationModel]);

  useEffect(() => {
    loadRows();
  }, [field.relationModel, field.inverseField, parentId]);

  async function loadRows() {
    if (!field.relationModel || !field.inverseField || !parentId) {
      setRows([]);
      return;
    }
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: field.relationModel, domain: [[field.inverseField, "=", parentId]], fields: columns.map((column) => column.name) } });
    setRows(data.records);
  }

  async function addRow() {
    if (!field.relationModel || !field.inverseField || !parentId || !relatedModel) return;
    const values: Record<string, unknown> = { [field.inverseField]: parentId };
    for (const column of columns) {
      if (column.defaultValue !== undefined && column.defaultValue !== null) values[column.name] = column.defaultValue;
    }
    await api("/api/model/create", { method: "POST", body: { model: field.relationModel, values } });
    await loadRows();
  }

  async function updateRow(row: Record<string, unknown>, name: string, value: unknown) {
    if (!field.relationModel) return;
    const nextRow = { ...row, [name]: value };
    if (name === "quantity" || name === "price_unit") {
      nextRow.price_subtotal = Number(nextRow.quantity ?? 0) * Number(nextRow.price_unit ?? 0);
    }
    setRows((current) => current.map((candidate) => (candidate.id === row.id ? nextRow : candidate)));
    await api("/api/model/write", { method: "POST", body: { model: field.relationModel, ids: [Number(row.id)], values: nextRow } });
    await loadRows();
  }

  async function removeRow(row: Record<string, unknown>) {
    if (!field.relationModel) return;
    await api("/api/model/unlink", { method: "POST", body: { model: field.relationModel, ids: [Number(row.id)] } });
    await loadRows();
  }

  return (
    <div className="one2many">
      <div className="one2many-header">
        <span>{field.label}</span>
        <button type="button" onClick={addRow} disabled={!parentId}><Plus size={16} />Add</button>
      </div>
      {!parentId ? <div className="one2many-empty">Save the parent record before adding lines.</div> : null}
      {parentId ? (
        <table>
          <thead>
            <tr>{columns.map((column) => <th key={column.name}>{column.label}</th>)}<th className="row-action"> </th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)}>
                {columns.map((column) => (
                  <td key={column.name}>
                    <InlineField field={column} value={row[column.name]} onChange={(value) => updateRow(row, column.name, value)} />
                  </td>
                ))}
                <td className="row-action"><button className="icon-button" type="button" title="Delete line" onClick={() => removeRow(row)}><Trash2 size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {parentId && rows.length === 0 ? <div className="one2many-empty">No lines</div> : null}
    </div>
  );
}

function InlineField({ field, value, onChange }: { field: FieldDefinition; value: unknown; onChange: (value: unknown) => void }) {
  if (field.type === "boolean") return <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />;
  if (field.type === "many2one") return <ManyToOneInput field={field} value={value} onChange={onChange} compact />;
  if (field.type === "selection") {
    return (
      <select value={String(value ?? field.defaultValue ?? "")} onChange={(event) => onChange(event.target.value)}>
        {(field.selectionOptions ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    );
  }
  return (
    <input
      type={field.name === "password" ? "password" : ["integer", "decimal"].includes(field.type) ? "number" : "text"}
      value={String(value ?? "")}
      onChange={(event) => onChange(field.type === "integer" ? Number(event.target.value) : field.type === "decimal" ? Number(event.target.value) : event.target.value)}
      readOnly={field.readonly}
    />
  );
}

function ManyToOneInput({ field, value, onChange, compact = false }: { field: FieldDefinition; value: unknown; onChange: (value: unknown) => void; compact?: boolean }) {
  const [options, setOptions] = useState<Array<{ id: number; label: string }>>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadSelectedLabel();
  }, [field.relationModel, value]);

  useEffect(() => {
    if (!open) return;
    loadOptions(query);
  }, [open, query, field.relationModel]);

  async function loadOptions(searchText: string) {
    if (!field.relationModel) {
      setOptions([]);
      return;
    }
    const relatedModel = await api<RuntimeModel>(`/api/model/${field.relationModel}/metadata`);
    const displayField = getDisplayField(relatedModel);
    const domain = searchText.trim() ? [[displayField, "ilike", searchText.trim()]] : [];
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: field.relationModel, domain, fields: [displayField], limit: 8 } });
    setOptions(data.records.map((record) => ({ id: Number(record.id), label: String(record[displayField] ?? record.id) })));
  }

  async function loadSelectedLabel() {
    if (!field.relationModel || value == null || value === "") {
      setQuery("");
      return;
    }
    const relatedModel = await api<RuntimeModel>(`/api/model/${field.relationModel}/metadata`);
    const displayField = getDisplayField(relatedModel);
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/read", { method: "POST", body: { model: field.relationModel, ids: [Number(value)], fields: [displayField] } });
    setQuery(String(data.records[0]?.[displayField] ?? value));
  }

  function selectOption(option: { id: number; label: string }) {
    onChange(option.id);
    setQuery(option.label);
    setOpen(false);
  }

  return (
    <div className={compact ? "many2one-picker compact" : "many2one-picker"}>
      <input
        value={query}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (!event.target.value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search..."
        readOnly={field.readonly}
      />
      {open && !field.readonly ? (
        <div className="many2one-options">
          {options.map((option) => (
            <button type="button" key={option.id} onMouseDown={(event) => event.preventDefault()} onClick={() => selectOption(option)}>
              {option.label}
            </button>
          ))}
          {options.length === 0 ? <div className="many2one-empty">No records</div> : null}
        </div>
      ) : null}
    </div>
  );
}

function fieldLabel(model: RuntimeModel, fieldName: string) {
  return model.fields.find((field) => field.name === fieldName)?.label ?? fieldName;
}

function formatValue(model: RuntimeModel, fieldName: string, value: unknown) {
  const field = model.fields.find((candidate) => candidate.name === fieldName);
  if (field?.type === "boolean") return value ? "Yes" : "No";
  if (field?.type === "many2one") return <ManyToOneDisplay field={field} value={value} />;
  return String(value ?? "");
}

function ManyToOneDisplay({ field, value }: { field: FieldDefinition; value: unknown }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    loadLabel();
  }, [field.relationModel, value]);

  async function loadLabel() {
    if (!field.relationModel || value == null || value === "") {
      setLabel("");
      return;
    }
    const relatedModel = await api<RuntimeModel>(`/api/model/${field.relationModel}/metadata`);
    const displayField = getDisplayField(relatedModel);
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/read", { method: "POST", body: { model: field.relationModel, ids: [Number(value)], fields: [displayField] } });
    setLabel(String(data.records[0]?.[displayField] ?? value));
  }

  return <span>{label || String(value ?? "")}</span>;
}

function getDisplayField(model: RuntimeModel) {
  return model.fields.find((field) => field.name === "name")?.name
    ?? model.fields.find((field) => field.name === "display_name")?.name
    ?? model.fields.find((field) => field.name === "technical_name")?.name
    ?? model.fields[0]?.name
    ?? "id";
}

async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: init?.body ? JSON.stringify(init.body) : undefined
  });
  if (response.status === 401 && path !== "/api/auth/login") {
    localStorage.removeItem(tokenStorageKey);
    authToken = null;
    window.dispatchEvent(new Event("auth:expired"));
  }
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

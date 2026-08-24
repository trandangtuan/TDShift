import { List, LogOut, Plus, RefreshCw, Settings, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button, ConfigProvider, Input, Layout } from "antd";
import type { ActionDefinition, Domain, RuntimeMenu, RuntimeView } from "@record-platform/core";
import AiChat from "./components/AiChat";
import FormRenderer from "./components/FormRenderer";
import LoginScreen from "./components/LoginScreen";
import ListRenderer from "./components/ListRenderer";
import MenuTree from "./components/MenuTree";
import type { AuthUser, RuntimeModel } from "./components/types";
import "./index.css";

const apiBase = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:3100" : "");
const tokenStorageKey = "record-platform-token";
let authToken = localStorage.getItem(tokenStorageKey);

type Mode = "list" | "form";

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
  const [columnDomain, setColumnDomain] = useState<Domain>([]);
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
    if (!nextAction.model) {
      setAction(nextAction);
      setModel(null);
      setView(null);
      setRecords([]);
      setSelectedId(null);
      setMode("list");
      return;
    }
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
    setQuery("");
    setColumnDomain([]);
    await loadRecords(nextAction.model, nextView, nextModel, 0, pageSize);
  }

  async function loadRecords(modelName = action?.model, activeView = view, activeModel = model, activePage = page, activePageSize = pageSize, activeColumnDomain = columnDomain) {
    if (!modelName || !activeView) return;
    const searchField = activeModel?.fields.find((field) => field.name === "name")?.name ?? activeModel?.fields.find((field) => field.name === "technical_name")?.name;
    const fields = activeView.architecture.type === "list" ? activeView.architecture.fields : undefined;
    const quickDomain: Domain = query && searchField ? [[searchField, "ilike", query]] : [];
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: modelName, domain: [...quickDomain, ...activeColumnDomain], fields, limit: activePageSize, offset: activePage * activePageSize } });
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
    setColumnDomain([]);
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

  async function refreshModuleList() {
    await api("/api/modules/refresh", { method: "POST" });
    await reloadMenus();
    await loadRecords(action?.model, view, model, 0, pageSize);
    setPage(0);
  }

  if (!authChecked) {
    return <div className="auth-loading">Loading session...</div>;
  }

  if (!token || !user) {
    return <LoginScreen api={api} onLogin={handleLogin} />;
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#0f766e", borderRadius: 6, colorBgLayout: "#f4f7f6", fontFamily: "'DM Sans', sans-serif" } }}>
      <Layout className="app">
      <Layout.Sider className="sidebar" width={248} theme="light">
        <div className="brand"><span className="brand-mark">R</span><div><strong>Record Platform</strong><small>Operations console</small></div></div>
        <div className="sidebar-menu">
          <MenuTree menus={menus} onOpen={openAction} />
        </div>
        <div className="sidebar-user">
          <div>
            <span>{user.name}</span>
            {user.login ? <small>{user.login}</small> : null}
          </div>
          <Button type="text" icon={<LogOut size={17} />} title="Logout" onClick={() => handleLogout()} />
        </div>
      </Layout.Sider>
      <Layout.Content className="workspace">
        {!action ? (
          <div className="empty-state">
            <Settings size={36} />
            <h1>Metadata runtime is ready</h1>
            <p>Choose a menu record. The sidebar, action, view, fields, and records are all resolved from runtime metadata.</p>
          </div>
        ) : action.technicalName === "ai.action_chat" ? (
          <>
            <div className="actionbar">
              <div>
                <h1>{action.name}</h1>
                <span>AI MCP client</span>
              </div>
            </div>
            <AiChat api={api} streamApi={streamApi} />
          </>
        ) : !model || !view ? (
          <div className="empty-state">
            <Settings size={36} />
            <h1>Unsupported action</h1>
            <p>This client action does not have a renderer yet.</p>
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
                    <Input.Search className="record-search" value={query} onChange={(event) => setQuery(event.target.value)} onSearch={() => {
                      setPage(0);
                      loadRecords(action.model, view, model, 0, pageSize);
                    }} placeholder="Search name" allowClear />
                    <Button icon={<RefreshCw size={17} />} onClick={() => loadRecords(action.model, view, model, page, pageSize)} title="Refresh list" />
                    {model.technicalName === "core.module" ? <Button icon={<UploadCloud size={17} />} onClick={refreshModuleList}>Refresh Modules</Button> : null}
                    <Button type="primary" icon={<Plus size={17} />} onClick={() => openForm(null)} title="Create" />
                  </>
                ) : (
                  <Button icon={<List size={17} />} onClick={backToList} title="Back to list" />
                )}
              </div>
            </div>
            {mode === "list" ? (
              <ListRenderer
                api={api}
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
                onFilterChange={async (nextDomain) => {
                  setColumnDomain(nextDomain);
                  setPage(0);
                  await loadRecords(action.model, view, model, 0, pageSize, nextDomain);
                }}
              />
            ) : (
              <FormRenderer
                api={api}
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
      </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
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

async function streamApi(path: string, init: { method?: string; body?: unknown; onEvent: (event: Record<string, unknown>) => void }) {
  const response = await fetch(`${apiBase}${path}`, {
    method: init.method ?? "GET",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: init.body ? JSON.stringify(init.body) : undefined
  });
  if (response.status === 401) {
    localStorage.removeItem(tokenStorageKey);
    authToken = null;
    window.dispatchEvent(new Event("auth:expired"));
  }
  if (!response.ok || !response.body) throw new Error(await response.text());
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      init.onEvent(JSON.parse(line));
    }
  }
  if (buffer.trim()) init.onEvent(JSON.parse(buffer));
}

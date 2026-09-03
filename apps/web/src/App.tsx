import { ChevronRight, List, LogOut, Plus, RefreshCw, Save, Settings, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, ConfigProvider, Input, Layout } from "antd";
import type { ActionDefinition, Domain, RuntimeMenu, RuntimeView } from "@record-platform/core";
import AiChat from "./components/AiChat";
import FormRenderer from "./components/FormRenderer";
import type { FormRendererHandle } from "./components/FormRenderer";
import Gallery from "./components/Gallery";
import LoginScreen from "./components/LoginScreen";
import ListRenderer from "./components/ListRenderer";
import MenuTree from "./components/MenuTree";
import type { AuthUser, RuntimeModel } from "./components/types";
import "./index.css";

const apiBase = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:3100" : "");
const tokenStorageKey = "record-platform-token";
let authToken = localStorage.getItem(tokenStorageKey);

type Mode = "list" | "form";
type BreadcrumbItem = { actionExternalId: string; id?: number | null; mode: Mode; label: string };

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
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const metadataCache = useRef({
    actions: new Map<string, ActionDefinition>(),
    models: new Map<string, RuntimeModel>(),
    views: new Map<string, RuntimeView>()
  });
  const formRef = useRef<FormRendererHandle | null>(null);

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

  useEffect(() => {
    const onPopState = () => openLocationRoute(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pageSize]);

  async function bootstrapSession() {
    try {
      const session = await api<{ user: AuthUser }>("/api/auth/me");
      setUser(session.user);
      await reloadMenus();
      await openLocationRoute(false);
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
    clearMetadataCache();
    setAuthChecked(true);
  }

  async function reloadMenus() {
    setMenus(await api<RuntimeMenu[]>("/api/ui/menus"));
  }

  function clearMetadataCache() {
    metadataCache.current.actions.clear();
    metadataCache.current.models.clear();
    metadataCache.current.views.clear();
  }

  async function getAction(externalId: string) {
    const cached = metadataCache.current.actions.get(externalId);
    if (cached) return cached;
    const loaded = await api<ActionDefinition>(`/api/ui/actions/${externalId}`);
    metadataCache.current.actions.set(externalId, loaded);
    return loaded;
  }

  async function getModel(modelName: string) {
    const cached = metadataCache.current.models.get(modelName);
    if (cached) return cached;
    const loaded = await api<RuntimeModel>(`/api/model/${modelName}/metadata`);
    metadataCache.current.models.set(modelName, loaded);
    return loaded;
  }

  async function getView(modelName: string, type: "list" | "form") {
    const key = `${modelName}:${type}`;
    const cached = metadataCache.current.views.get(key);
    if (cached) return cached;
    const loaded = await api<RuntimeView>(`/api/ui/views?model=${modelName}&type=${type}`);
    metadataCache.current.views.set(key, loaded);
    return loaded;
  }

  async function openAction(externalId: string, options: { push?: boolean; crumb?: BreadcrumbItem | null } = {}) {
    const nextAction = await getAction(externalId);
    if (!nextAction.model) {
      setAction(nextAction);
      setModel(null);
      setView(null);
      setRecords([]);
      setSelectedId(null);
      setMode("list");
      if (options.push !== false) pushWorkspaceUrl(externalId, "list");
      return;
    }
    const [nextModel, nextView] = await Promise.all([
      getModel(nextAction.model),
      getView(nextAction.model, "list")
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
    if (options.crumb !== undefined) setBreadcrumbs(options.crumb ? [options.crumb] : []);
    else setBreadcrumbs([]);
    if (options.push !== false) pushWorkspaceUrl(externalId, "list");
  }

  async function loadRecords(modelName = action?.model, activeView = view, activeModel = model, activePage = page, activePageSize = pageSize, activeColumnDomain = columnDomain) {
    if (!modelName || !activeView) return;
    const searchField = activeModel?.fields.find((field) => field.name === "name")?.name ?? activeModel?.fields.find((field) => field.name === "technical_name")?.name;
    const fields = activeView.architecture.type === "list" ? activeView.architecture.fields : undefined;
    const quickDomain: Domain = query && searchField ? [[searchField, "ilike", query]] : [];
    const data = await api<{ records: Record<string, unknown>[] }>("/api/model/search_read", { method: "POST", body: { model: modelName, domain: [...quickDomain, ...activeColumnDomain], fields, limit: activePageSize, offset: activePage * activePageSize } });
    setRecords(data.records);
  }

  async function openForm(id: number | null, options: { push?: boolean } = {}) {
    if (!action?.model) return;
    const nextView = await getView(action.model, "form");
    setView(nextView);
    setSelectedId(id);
    setMode("form");
    if (options.push !== false) pushWorkspaceUrl(action.technicalName, "form", id);
  }

  async function backToList(options: { push?: boolean } = {}) {
    if (!action?.model) return;
    const nextView = await getView(action.model, "list");
    setView(nextView);
    setMode("list");
    setSelectedId(null);
    setColumnDomain([]);
    await loadRecords(action.model, nextView);
    if (options.push !== false) pushWorkspaceUrl(action.technicalName, "list");
  }

  async function removeSelectedRecord() {
    if (!action?.model || !selectedId) return;
    await api("/api/model/unlink", { method: "POST", body: { model: action.model, ids: [selectedId] } });
    await backToList();
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
    if (action?.technicalName) pushWorkspaceUrl(action.technicalName, "form", id);
  }

  async function openRecord(actionExternalId: string, id: number, label?: string, options: { push?: boolean; crumb?: BreadcrumbItem | null } = {}) {
    const nextAction = await getAction(actionExternalId);
    if (!nextAction.model) return;
    const [nextModel, nextView, data] = await Promise.all([
      getModel(nextAction.model),
      getView(nextAction.model, "form"),
      api<{ records: Record<string, unknown>[] }>("/api/model/read", { method: "POST", body: { model: nextAction.model, ids: [id] } })
    ]);
    setAction(nextAction);
    setModel(nextModel);
    setView(nextView);
    setRecords(data.records);
    setSelectedId(id);
    setMode("form");
    setPage(0);
    setQuery("");
    setColumnDomain([]);
    if (options.crumb !== undefined) setBreadcrumbs(options.crumb ? [options.crumb] : []);
    else if (action?.technicalName && selectedId) setBreadcrumbs([{ actionExternalId: action.technicalName, id: selectedId, mode, label: label ?? action.name }]);
    if (options.push !== false) pushWorkspaceUrl(actionExternalId, "form", id);
  }

  async function openBreadcrumb(item: BreadcrumbItem) {
    if (item.mode === "form" && item.id) {
      await openRecord(item.actionExternalId, item.id, item.label, { crumb: null });
      return;
    }
    await openAction(item.actionExternalId, { crumb: null });
  }

  async function openLocationRoute(push = false) {
    const route = workspaceRoute();
    if (!route) return;
    if (route.mode === "form" && route.id) {
      await openRecord(route.actionExternalId, route.id, undefined, { push, crumb: null });
      return;
    }
    await openAction(route.actionExternalId, { push, crumb: null });
  }

  async function refreshModuleList() {
    await api("/api/modules/refresh", { method: "POST" });
    clearMetadataCache();
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
    <ConfigProvider theme={{ token: { colorPrimary: "#0f766e", borderRadius: 5, colorBgLayout: "#f4f7f6", controlHeight: 28, fontFamily: "'DM Sans', sans-serif", fontSize: 12 } }}>
      <Layout className="app">
      <Layout.Sider className="sidebar" width={216} theme="light">
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
        ) : action.technicalName === "gallery.action_gallery" || action.technicalName === "gallery.action_timeline" ? (
          <Gallery api={api} initialView={action.technicalName === "gallery.action_timeline" ? "timeline" : "gallery"} />
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
                <Breadcrumbs items={breadcrumbs} current={mode === "form" && selectedRecord ? String(selectedRecord.name ?? selectedRecord.id) : action.name} onOpen={openBreadcrumb} />
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
                  <>
                    <Button className="icon-button" icon={<List size={17} />} onClick={() => backToList()} title="Back to list" />
                    <Button className="icon-button" type="primary" icon={<Save size={17} />} onClick={() => formRef.current?.save()} title="Save" />
                    {selectedId ? <Button className="icon-button" icon={<RefreshCw size={17} />} onClick={() => stayOnFormAfterSave(selectedId)} title="Reset" /> : null}
                    {selectedId ? <Button className="icon-button" danger icon={<Trash2 size={17} />} onClick={removeSelectedRecord} title="Delete" /> : null}
                  </>
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
                ref={formRef}
                api={api}
                model={model}
                view={view}
                record={selectedRecord}
                onSaved={stayOnFormAfterSave}
                onRegistryChanged={async () => {
                  clearMetadataCache();
                  await reloadMenus();
                  await backToList();
                }}
                onOpenRecord={(actionExternalId, id, label) => openRecord(actionExternalId, id, label)}
              />
            )}
          </>
        )}
      </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}

function Breadcrumbs({ items, current, onOpen }: { items: BreadcrumbItem[]; current: string; onOpen: (item: BreadcrumbItem) => void }) {
  if (!items.length) return null;
  return <div className="breadcrumbs">
    {items.map((item, index) => <span key={`${item.actionExternalId}-${item.id ?? "list"}-${index}`} className="breadcrumb-item">
      <button onClick={() => onOpen(item)}>{item.label}</button>
      <ChevronRight size={12} />
    </span>)}
    <span>{current}</span>
  </div>;
}

function workspaceRoute() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] !== "web" || !parts[1]) return null;
  const actionExternalId = decodeURIComponent(parts[1]);
  const mode = parts[2] === "form" ? "form" : "list";
  const id = mode === "form" && parts[3] ? Number(parts[3]) : null;
  return { actionExternalId, mode: mode as Mode, id: Number.isFinite(id) ? id : null };
}

function pushWorkspaceUrl(actionExternalId: string, mode: Mode, id?: number | null) {
  const nextPath = `/web/${encodeURIComponent(actionExternalId)}/${mode}${mode === "form" && id ? `/${id}` : ""}`;
  if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
}

async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const body = init?.body ? isFormData ? init.body as FormData : JSON.stringify(init.body) : undefined;
  const response = await fetch(`${apiBase}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      ...(init?.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body
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

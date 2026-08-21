import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyRequest } from "fastify";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureAdminUser, getUserFromRequest, login, registerUser, resetUserToken } from "./auth";
import { config } from "./config";
import { bootstrapModules, db, installModuleRecords, uninstallModuleAndDropOwnedFields } from "./db";
import { moduleDefinitions } from "./modules";
import { buildRegistry, createEnvironment } from "./registry";

bootstrapModules(moduleDefinitions);
if ((db.prepare("SELECT COUNT(*) AS count FROM core_model").get() as { count: number }).count === 0) {
  bootstrapModules(moduleDefinitions, { forceInstall: true });
}
ensureAdminUser();
let registry = buildRegistry();

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
const webDistPath = findWebDistPath();

app.addHook("preHandler", async (request, reply) => {
  if (!request.url.startsWith("/api/")) return;
  if (request.url === "/api/health" || request.url === "/api/auth/login" || request.url === "/api/auth/register") return;
  const user = getUserFromRequest(request);
  if (!user) return reply.code(401).send({ error: "Authentication required" });
});

app.get("/api/health", async () => ({ ok: true, models: registry.models.size, actions: registry.actions.size }));

app.post<{ Body: { login: string; password: string } }>("/api/auth/login", async (request, reply) => {
  const result = login(request.body.login, request.body.password);
  if (!result) return reply.code(401).send({ error: "Invalid login or password" });
  return result;
});

app.post<{ Body: { login: string; name: string; email?: string; password: string } }>("/api/auth/register", async (request, reply) => {
  if (!request.body.login || !request.body.name || !request.body.password) return reply.code(400).send({ error: "Login, name, and password are required" });
  try {
    return registerUser(request.body);
  } catch (error: any) {
    if (error?.code === "SQLITE_CONSTRAINT_UNIQUE") return reply.code(409).send({ error: "Login already exists" });
    throw error;
  }
});

app.get("/api/auth/me", async (request) => {
  const user = getUserFromRequest(request);
  if (!user) throw new Error("Authentication required");
  return { user };
});

app.post("/api/auth/reset-token", async (request, reply) => {
  const user = getUserFromRequest(request);
  if (!user) return reply.code(401).send({ error: "Authentication required" });
  const result = resetUserToken(user.id);
  if (!result) return reply.code(404).send({ error: "User not found" });
  return result;
});

app.post("/api/auth/logout", async () => ({ ok: true }));

app.get("/api/ui/menus", async () => registry.menus);

app.get<{ Params: { externalId: string } }>("/api/ui/actions/:externalId", async (request) => {
  const action = registry.actions.get(request.params.externalId);
  if (!action) throw new Error(`Action not found: ${request.params.externalId}`);
  return action;
});

app.get<{ Querystring: { model: string; type: string } }>("/api/ui/views", async (request) => {
  const view = [...registry.views.values()].find((candidate) => candidate.model === request.query.model && candidate.type === request.query.type);
  if (!view) throw new Error(`View not found: ${request.query.model}/${request.query.type}`);
  return view;
});

app.get<{ Params: { model: string } }>("/api/model/:model/metadata", async (request) => {
  const model = registry.models.get(request.params.model);
  if (!model) throw new Error(`Model not found: ${request.params.model}`);
  return model;
});

app.post<{ Body: { model: string; domain?: any[]; limit?: number; offset?: number } }>("/api/model/search", async (request) => {
  const env = createRequestEnvironment(request);
  return { ids: await env.model(request.body.model).search(request.body.domain as any, { limit: request.body.limit, offset: request.body.offset }) };
});

app.post<{ Body: { model: string; ids: number[]; fields?: string[] } }>("/api/model/read", async (request) => {
  const env = createRequestEnvironment(request);
  return { records: await env.model(request.body.model).read(request.body.ids, request.body.fields) };
});

app.post<{ Body: { model: string; domain?: any[]; fields?: string[]; limit?: number; offset?: number } }>("/api/model/search_read", async (request) => {
  const env = createRequestEnvironment(request);
  return { records: await env.model(request.body.model).searchRead(request.body.domain as any, request.body.fields, { limit: request.body.limit, offset: request.body.offset }) };
});

app.post<{ Body: { model: string; values: Record<string, unknown> } }>("/api/model/create", async (request) => {
  const env = createRequestEnvironment(request);
  return { id: await env.model(request.body.model).create(request.body.values) };
});

app.post<{ Body: { model: string; ids: number[]; values: Record<string, unknown> } }>("/api/model/write", async (request) => {
  const env = createRequestEnvironment(request);
  await env.model(request.body.model).write(request.body.ids, request.body.values);
  return { ok: true };
});

app.post<{ Body: { model: string; ids: number[] } }>("/api/model/unlink", async (request) => {
  const env = createRequestEnvironment(request);
  await env.model(request.body.model).unlink(request.body.ids);
  return { ok: true };
});

app.post<{ Body: { model: string; method: string; ids: number[]; args?: unknown[] } }>("/api/model/call", async (request) => {
  const env = createRequestEnvironment(request);
  return { result: await env.model(request.body.model).call(request.body.method, request.body.ids, request.body.args) };
});

app.post("/api/modules/refresh", async () => {
  bootstrapModules(moduleDefinitions);
  registry = buildRegistry();
  return { ok: true, modules: db.prepare("SELECT technical_name, state FROM core_module ORDER BY sequence, technical_name").all() };
});

app.post<{ Body: { module: string } }>("/api/modules/install", async (request) => {
  const modules = resolveInstallSet(request.body.module);
  bootstrapModules(modules, { forceInstall: true });
  for (const mod of modules) installModuleRecords(mod.technicalName);
  registry = buildRegistry();
  return { ok: true, installed: db.prepare("SELECT technical_name FROM core_module WHERE state = 'INSTALLED'").all() };
});

app.post<{ Body: { module: string } }>("/api/modules/upgrade", async (request) => {
  const mod = moduleDefinitions.find((candidate) => candidate.technicalName === request.body.module);
  if (!mod) throw new Error(`Unknown module: ${request.body.module}`);
  const row = db.prepare("SELECT state FROM core_module WHERE technical_name = ?").get(mod.technicalName) as { state: string } | undefined;
  if (row?.state !== "INSTALLED") throw new Error(`Module must be installed before upgrade: ${mod.technicalName}`);
  bootstrapModules([mod], { applyMetadata: true });
  installModuleRecords(mod.technicalName);
  registry = buildRegistry();
  return { ok: true, module: mod.technicalName };
});

app.post<{ Body: { module: string } }>("/api/modules/uninstall", async (request) => {
  uninstallModuleAndDropOwnedFields(request.body.module);
  registry = buildRegistry();
  return { ok: true, installed: db.prepare("SELECT technical_name FROM core_module WHERE state = 'INSTALLED'").all() };
});

if (webDistPath) {
  await app.register(fastifyStatic, { root: join(webDistPath, "assets"), prefix: "/assets/", wildcard: false });
  app.get("/web", async (_request, reply) => reply.sendFile("index.html", webDistPath));
  app.get("/web/*", async (_request, reply) => reply.sendFile("index.html", webDistPath));
}

app.get("/", async (_request, reply) => renderWebsitePage("home", reply));

app.get<{ Params: { slug: string } }>("/:slug", async (request, reply) => {
  if (request.url.startsWith("/api/") || request.url.startsWith("/assets/") || request.url.startsWith("/web")) return reply.callNotFound();
  return renderWebsitePage(request.params.slug, reply);
});

await app.listen({ port: config.port, host: "0.0.0.0" });

function resolveInstallSet(moduleName: string) {
  const byName = new Map(moduleDefinitions.map((mod) => [mod.technicalName, mod]));
  const result: typeof moduleDefinitions = [];
  const seen = new Set<string>();
  const visit = (name: string) => {
    if (seen.has(name)) return;
    const mod = byName.get(name);
    if (!mod) throw new Error(`Unknown module: ${name}`);
    seen.add(name);
    for (const dep of mod.depends ?? []) visit(dep);
    result.push(mod);
  };
  visit(moduleName);
  return result;
}

function createRequestEnvironment(request: FastifyRequest) {
  const user = getUserFromRequest(request);
  if (!user) throw new Error("Authentication required");
  return createEnvironment(registry, {}, user);
}

function renderWebsitePage(slug: string, reply: any) {
  const normalizedSlug = normalizeSlug(slug);
  const page = getPublishedWebsitePage(normalizedSlug);
  if (!page) return reply.code(404).type("text/html").send(renderNotFound(normalizedSlug));
  return reply.type("text/html").send(renderPage(page, getPublishedWebsiteMenus()));
}

function getPublishedWebsitePage(slug: string) {
  try {
    const hasViewName = tableHasColumn("website_page", "view_name");
    const hasLegacyContent = tableHasColumn("website_page", "content_html");
    return db.prepare(`
      SELECT title, meta_description${hasViewName ? ", view_name" : ""}${hasLegacyContent ? ", content_html" : ""}
      FROM website_page
      WHERE slug = ?
        AND is_published = 1
        AND active = 1
      ORDER BY id DESC
      LIMIT 1
    `).get(slug) as { title: string; meta_description: string | null; view_name?: string | null; content_html?: string | null } | undefined;
  } catch (error: any) {
    if (error?.code === "SQLITE_ERROR") return undefined;
    throw error;
  }
}

function normalizeSlug(slug: string) {
  const trimmed = slug.trim().replace(/^\/+|\/+$/g, "");
  return trimmed || "home";
}

function getPublishedWebsiteMenus() {
  try {
    return db.prepare(`
      SELECT label, url
      FROM website_menu
      WHERE is_published = 1
        AND active = 1
      ORDER BY sequence, id
    `).all() as Array<{ label: string; url: string }>;
  } catch (error: any) {
    if (error?.code === "SQLITE_ERROR") return [];
    throw error;
  }
}

function renderPage(page: { title: string; meta_description: string | null; view_name?: string | null; content_html?: string | null }, menus: Array<{ label: string | null; url: string | null }>) {
  const links = menus.filter((menu) => menu.label && menu.url).map((menu) => `<a href="${escapeHtml(menu.url)}">${escapeHtml(menu.label)}</a>`);
  const navigation = links.length ? `<nav>${links.join("")}</nav>` : "";
  const content = getWebsiteViewContent(page.view_name) ?? page.content_html ?? "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.meta_description ?? "")}">
    <style>
      body { color: #222832; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; margin: 0; }
      nav { align-items: center; border-bottom: 1px solid #e5e7eb; display: flex; gap: 24px; padding: 16px 20px; }
      nav a { color: #111827; font-weight: 600; text-decoration: none; }
      main { margin: 0 auto; max-width: 920px; padding: 48px 20px; }
      h1 { font-size: 40px; line-height: 1.15; margin: 0 0 18px; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    ${navigation}
    <main>${content}</main>
  </body>
</html>`;
}

function getWebsiteViewContent(viewName: string | null | undefined) {
  if (!viewName) return null;
  const view = db.prepare(`
    SELECT content, content_type
    FROM core_view
    WHERE technical_name = ?
      AND is_active = 1
    LIMIT 1
  `).get(viewName) as { content: string | null; content_type: string | null } | undefined;
  if (!view || view.content_type !== "html") return null;
  return view.content ?? "";
}

function renderNotFound(slug: string) {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found</title></head>
  <body><main><h1>Page not found</h1><p>No published page for ${escapeHtml(slug)}.</p></main></body>
</html>`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function tableHasColumn(tableName: string, columnName: string) {
  try {
    return (db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>).some((column) => column.name === columnName);
  } catch {
    return false;
  }
}

function findWebDistPath() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(process.cwd(), "..", "web", "dist"),
    resolve(process.cwd(), "apps", "web", "dist"),
    resolve(currentDir, "..", "..", "web", "dist"),
    resolve(currentDir, "..", "..", "..", "web", "dist"),
    resolve(currentDir, "..", "..", "..", "apps", "web", "dist"),
    resolve(currentDir, "..", "..", "..", "..", "..", "web", "dist")
  ];
  return candidates.find((candidate) => existsSync(join(candidate, "index.html")));
}

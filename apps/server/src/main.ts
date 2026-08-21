import cors from "@fastify/cors";
import Fastify, { type FastifyRequest } from "fastify";
import { ensureAdminUser, getUserFromRequest, login, registerUser, resetUserToken } from "./auth";
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

const port = Number(process.env.PORT ?? 3100);
await app.listen({ port, host: "0.0.0.0" });

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

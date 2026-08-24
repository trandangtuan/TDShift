import type { ModuleRoute } from "@record-platform/core";
import { ensureAdminUser, getUserFromRequest, login, registerUser, resetUserToken } from "../../apps/server/src/auth";
import { bootstrapModules, installModuleRecords, uninstallModuleAndDropOwnedFields } from "../../apps/server/src/db";

export const baseRoutes: ModuleRoute[] = [
  {
    async register({ app, db, modules, getRegistry, rebuildRegistry, createRequestEnvironment }) {
      app.get("/api/health", async () => ({ ok: true, models: getRegistry().models.size, actions: getRegistry().actions.size }));

      app.post("/api/auth/login", async (request: any, reply: any) => {
        const result = login(request.body.login, request.body.password);
        if (!result) return reply.code(401).send({ error: "Invalid login or password" });
        return result;
      });

      app.post("/api/auth/register", async (request: any, reply: any) => {
        if (!request.body.login || !request.body.name || !request.body.password) return reply.code(400).send({ error: "Login, name, and password are required" });
        try {
          return registerUser(request.body);
        } catch (error: any) {
          if (error?.code === "SQLITE_CONSTRAINT_UNIQUE") return reply.code(409).send({ error: "Login already exists" });
          throw error;
        }
      });

      app.get("/api/auth/me", async (request: any) => {
        const user = getUserFromRequest(request);
        if (!user) throw new Error("Authentication required");
        return { user };
      });

      app.post("/api/auth/reset-token", async (request: any, reply: any) => {
        const user = getUserFromRequest(request);
        if (!user) return reply.code(401).send({ error: "Authentication required" });
        const result = resetUserToken(user.id);
        if (!result) return reply.code(404).send({ error: "User not found" });
        return result;
      });

      app.post("/api/auth/logout", async () => ({ ok: true }));

      app.get("/api/ui/menus", async () => getRegistry().menus);
      app.get("/api/ui/actions/:externalId", async (request: any) => {
        const action = getRegistry().actions.get(request.params.externalId);
        if (!action) throw new Error(`Action not found: ${request.params.externalId}`);
        return action;
      });
      app.get("/api/ui/views", async (request: any) => {
        const view = [...getRegistry().views.values()].find((candidate) => candidate.model === request.query.model && candidate.type === request.query.type);
        if (!view) throw new Error(`View not found: ${request.query.model}/${request.query.type}`);
        return view;
      });
      app.get("/api/models", async () => [...getRegistry().models.values()].map(({ technicalName, name, tableName, fields }) => ({ technicalName, name, tableName, fields })));

      app.get("/api/model/:model/metadata", async (request: any, reply: any) => {
        const model = getRegistry().models.get(request.params.model);
        if (!model) return reply.code(404).send({ error: `Model not found: ${request.params.model}` });
        return model;
      });
      app.post("/api/model/search", async (request: any) => ({ ids: await createRequestEnvironment(request).model(request.body.model).search(request.body.domain, { limit: request.body.limit, offset: request.body.offset }) }));
      app.post("/api/model/read", async (request: any) => ({ records: await createRequestEnvironment(request).model(request.body.model).read(request.body.ids, request.body.fields) }));
      app.post("/api/model/search_read", async (request: any) => ({ records: await createRequestEnvironment(request).model(request.body.model).searchRead(request.body.domain, request.body.fields, { limit: request.body.limit, offset: request.body.offset }) }));
      app.post("/api/model/create", async (request: any) => ({ id: await createRequestEnvironment(request).model(request.body.model).create(request.body.values) }));
      app.post("/api/model/write", async (request: any) => {
        await createRequestEnvironment(request).model(request.body.model).write(request.body.ids, request.body.values);
        return { ok: true };
      });
      app.post("/api/model/unlink", async (request: any) => {
        await createRequestEnvironment(request).model(request.body.model).unlink(request.body.ids);
        return { ok: true };
      });
      app.post("/api/model/call", async (request: any) => ({ result: await createRequestEnvironment(request).model(request.body.model).call(request.body.method, request.body.ids, request.body.args) }));

      app.post("/api/modules/refresh", async () => {
        bootstrapModules(modules);
        rebuildRegistry();
        return { ok: true, modules: db.prepare("SELECT technical_name, state FROM core_module ORDER BY sequence, technical_name").all() };
      });
      app.post("/api/modules/install", async (request: any) => {
        const installSet = resolveInstallSet(modules, request.body.module);
        bootstrapModules(installSet, { forceInstall: true });
        for (const mod of installSet) installModuleRecords(mod.technicalName);
        rebuildRegistry();
        return { ok: true, installed: db.prepare("SELECT technical_name FROM core_module WHERE state = 'INSTALLED'").all() };
      });
      app.post("/api/modules/upgrade", async (request: any, reply: any) => {
        const mod = modules.find((candidate) => candidate.technicalName === request.body.module);
        if (!mod) return reply.code(404).send({ error: `Unknown module: ${request.body.module}` });
        const row = db.prepare("SELECT state FROM core_module WHERE technical_name = ?").get(mod.technicalName) as { state: string } | undefined;
        if (row?.state !== "INSTALLED") return reply.code(400).send({ error: `Module must be installed before upgrade: ${mod.technicalName}` });
        bootstrapModules([mod], { applyMetadata: true });
        installModuleRecords(mod.technicalName);
        rebuildRegistry();
        return { ok: true, module: mod.technicalName };
      });
      app.post("/api/modules/uninstall", async (request: any) => {
        uninstallModuleAndDropOwnedFields(request.body.module);
        rebuildRegistry();
        return { ok: true, installed: db.prepare("SELECT technical_name FROM core_module WHERE state = 'INSTALLED'").all() };
      });

      ensureAdminUser();
    }
  }
];

function resolveInstallSet(modules: ModuleRouteContextModules, moduleName: string) {
  const byName = new Map(modules.map((mod) => [mod.technicalName, mod]));
  const result: typeof modules = [];
  const seen = new Set<string>();
  const visit = (name: string) => {
    if (seen.has(name)) return;
    const mod = byName.get(name);
    if (!mod) throw new Error(`Unknown module: ${name}`);
    seen.add(name);
    for (const dependency of mod.depends ?? []) visit(dependency);
    result.push(mod);
  };
  visit(moduleName);
  return result;
}

type ModuleRouteContextModules = Parameters<NonNullable<ModuleRoute["register"]>>[0]["modules"];

import type { ModuleRoute } from "@record-platform/core";
import { ensureAdminUser, getUserFromRequest, login, registerUser, resetUserToken } from "../../apps/server/src/auth";
import { getAttachmentObject, storeAttachmentStream } from "../../apps/server/src/attachments";
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

      app.get("/api/attachments/:id/download", async (request: any, reply: any) => {
        const env = createRequestEnvironment(request);
        const [attachment] = await env.model("ir.attachment").read([Number(request.params.id)], ["name", "file_name", "mime_type", "storage", "bucket", "object_name", "url"]);
        if (!attachment) return reply.code(404).send({ error: "Attachment not found" });
        if (attachment.storage === "url" && attachment.url) return reply.redirect(String(attachment.url));
        if (attachment.storage !== "minio" || !attachment.bucket || !attachment.object_name) return reply.code(404).send({ error: "Attachment object not found" });
        const stream = await getAttachmentObject(String(attachment.bucket), String(attachment.object_name));
        return reply
          .header("Content-Type", String(attachment.mime_type || "application/octet-stream"))
          .header("Content-Disposition", `attachment; filename="${String(attachment.file_name || attachment.name || "attachment").replace(/"/g, "")}"`)
          .send(stream);
      });

      app.post("/api/attachments/upload", async (request: any, reply: any) => {
        const file = await request.file();
        if (!file) return reply.code(400).send({ error: "File is required" });
        const fields = multipartFields(file.fields);
        const stored = await storeAttachmentStream({ stream: file.file, fileName: file.filename, mimeType: file.mimetype });
        const env = createRequestEnvironment(request);
        const id = await env.model("ir.attachment").create({
          name: fields.name || file.filename,
          file_name: file.filename,
          mime_type: file.mimetype,
          storage: "minio",
          datas: null,
          res_model: fields.res_model || null,
          res_id: fields.res_id ? Number(fields.res_id) : null,
          public: fields.public === "true",
          active: true,
          ...stored
        });
        return { id, ...stored };
      });

      app.post("/api/modules/refresh", async () => {
        app.log.info({ event: "module-refresh-start" }, "Refreshing code modules");
        bootstrapModules(modules);
        rebuildRegistry();
        app.log.info({ event: "module-refresh-done", modules: modules.length }, "Code modules refreshed");
        return { ok: true, modules: db.prepare("SELECT technical_name, state FROM core_module ORDER BY sequence, technical_name").all() };
      });
      app.post("/api/modules/install", async (request: any) => {
        const user = getUserFromRequest(request);
        app.log.info({ event: "module-install-start", module: request.body.module, user: user?.login }, "Installing module");
        const installSet = resolveInstallSet(modules, request.body.module);
        app.log.info({ event: "module-install-dependencies", module: request.body.module, installSet: installSet.map((mod) => mod.technicalName) }, "Resolved module install set");
        bootstrapModules(installSet, { forceInstall: true });
        for (const mod of installSet) installModuleRecords(mod.technicalName);
        rebuildRegistry();
        app.log.info({ event: "module-install-done", module: request.body.module, installed: installSet.map((mod) => mod.technicalName) }, "Module installed");
        return { ok: true, installed: db.prepare("SELECT technical_name FROM core_module WHERE state = 'INSTALLED'").all() };
      });
      app.post("/api/modules/upgrade", async (request: any, reply: any) => {
        const user = getUserFromRequest(request);
        app.log.info({ event: "module-upgrade-start", module: request.body.module, user: user?.login }, "Upgrading module");
        const mod = modules.find((candidate) => candidate.technicalName === request.body.module);
        if (!mod) return reply.code(404).send({ error: `Unknown module: ${request.body.module}` });
        const row = db.prepare("SELECT state FROM core_module WHERE technical_name = ?").get(mod.technicalName) as { state: string } | undefined;
        if (row?.state !== "INSTALLED") return reply.code(400).send({ error: `Module must be installed before upgrade: ${mod.technicalName}` });
        bootstrapModules([mod], { applyMetadata: true });
        installModuleRecords(mod.technicalName);
        rebuildRegistry();
        app.log.info({ event: "module-upgrade-done", module: mod.technicalName }, "Module upgraded");
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

function multipartFields(fields: Record<string, any>) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, String(value?.value ?? "")]));
}

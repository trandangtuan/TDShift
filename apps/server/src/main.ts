import cors from "@fastify/cors";
import httpProxy from "@fastify/http-proxy";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyRequest } from "fastify";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureAdminUser, getDatabaseNameFromToken, getUserFromRequest } from "./auth";
import { config } from "./config";
import { bootstrapModules, db, enterDatabase, getCurrentDatabaseName } from "./db";
import { moduleDefinitions } from "./modules";
import { buildRegistry, createEnvironment } from "./registry";

bootstrapModules(moduleDefinitions);
if ((db.prepare("SELECT COUNT(*) AS count FROM core_model").get() as { count: number }).count === 0) {
  const baseModule = moduleDefinitions.find((module) => module.technicalName === "base");
  if (!baseModule) throw new Error("The base module must be available on first startup.");
  bootstrapModules([baseModule], { forceInstall: true });
}
ensureAdminUser();
const registries = new Map([[getCurrentDatabaseName(), buildRegistry()]]);

const app = Fastify({ logger: true, bodyLimit: 5 * 1024 * 1024 });
await app.register(cors, { origin: true });
await app.register(multipart, { limits: { fileSize: 1024 * 1024 * 1024 } });
const webDistPath = findWebDistPath();

if (process.env.NEXT_SITE_URL) {
  await app.register(httpProxy, {
    upstream: config.nextSiteUrl,
    routes: ["/", "/:slug", "/:slug/*"],
    http2: false
  });
}

app.addHook("preHandler", async (request, reply) => {
  if (!request.url.startsWith("/api/")) return;
  if (request.url === "/api/health" || request.url === "/api/databases" || request.url === "/api/auth/login" || request.url === "/api/auth/register" || request.url.startsWith("/api/website/") || request.url.startsWith("/api/website-sale/")) return;
  const user = getUserFromRequest(request);
  if (!user) return reply.code(401).send({ error: "Authentication required" });
});

app.addHook("onRequest", async (request) => {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return;
  const database = getDatabaseNameFromToken(header.slice("Bearer ".length), request.hostname);
  if (database) enterDatabase(database);
});

if (webDistPath) {
  await app.register(fastifyStatic, { root: join(webDistPath, "assets"), prefix: "/assets/", wildcard: false });
  app.get("/web", async (_request, reply) => reply.sendFile("index.html", webDistPath));
  app.get("/web/*", async (_request, reply) => reply.sendFile("index.html", webDistPath));
}

for (const module of moduleDefinitions) {
  for (const route of module.routes ?? []) {
    await route.register({ app, db, modules: moduleDefinitions, getRegistry: () => getRegistry(), rebuildRegistry: () => { registries.set(getCurrentDatabaseName(), buildRegistry()); }, createRequestEnvironment });
  }
}

await app.listen({ port: config.port, host: "0.0.0.0" });

function createRequestEnvironment(request: FastifyRequest) {
  const user = getUserFromRequest(request);
  if (!user) throw new Error("Authentication required");
  return createEnvironment(getRegistry(), {}, user);
}

function getRegistry() {
  const database = getCurrentDatabaseName();
  let registry = registries.get(database);
  if (!registry) {
    registry = buildRegistry();
    registries.set(database, registry);
  }
  return registry;
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

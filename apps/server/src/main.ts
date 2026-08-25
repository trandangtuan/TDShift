import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyRequest } from "fastify";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureAdminUser, getUserFromRequest } from "./auth";
import { config } from "./config";
import { bootstrapModules, db } from "./db";
import { moduleDefinitions } from "./modules";
import { buildRegistry, createEnvironment } from "./registry";

bootstrapModules(moduleDefinitions);
if ((db.prepare("SELECT COUNT(*) AS count FROM core_model").get() as { count: number }).count === 0) {
  bootstrapModules(moduleDefinitions, { forceInstall: true });
}
ensureAdminUser();
let registry = buildRegistry();

const app = Fastify({ logger: true, bodyLimit: 5 * 1024 * 1024 });
await app.register(cors, { origin: true });
await app.register(multipart, { limits: { fileSize: 1024 * 1024 * 1024 } });
const webDistPath = findWebDistPath();

app.addHook("preHandler", async (request, reply) => {
  if (!request.url.startsWith("/api/")) return;
  if (request.url === "/api/health" || request.url === "/api/auth/login" || request.url === "/api/auth/register") return;
  const user = getUserFromRequest(request);
  if (!user) return reply.code(401).send({ error: "Authentication required" });
});

if (webDistPath) {
  await app.register(fastifyStatic, { root: join(webDistPath, "assets"), prefix: "/assets/", wildcard: false });
  app.get("/web", async (_request, reply) => reply.sendFile("index.html", webDistPath));
  app.get("/web/*", async (_request, reply) => reply.sendFile("index.html", webDistPath));
}

for (const module of moduleDefinitions) {
  for (const route of module.routes ?? []) {
    await route.register({ app, db, modules: moduleDefinitions, getRegistry: () => registry, rebuildRegistry: () => { registry = buildRegistry(); }, createRequestEnvironment });
  }
}

await app.listen({ port: config.port, host: "0.0.0.0" });

function createRequestEnvironment(request: FastifyRequest) {
  const user = getUserFromRequest(request);
  if (!user) throw new Error("Authentication required");
  return createEnvironment(registry, {}, user);
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

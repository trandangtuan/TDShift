import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), "..", "..", ".env"));

export const config = {
  port: Number(process.env.PORT ?? 3100),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  jwtExpiresSeconds: Number(process.env.JWT_EXPIRES_SECONDS ?? 60 * 60 * 8),
  adminLogin: process.env.ADMIN_LOGIN ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin",
  adminName: process.env.ADMIN_NAME ?? "Administrator",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@example.local",
  websiteBaseUrl: process.env.WEBSITE_BASE_URL ?? `http://localhost:${Number(process.env.PORT ?? 3100)}`
};

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

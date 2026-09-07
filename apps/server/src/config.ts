import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), "..", "..", ".env"));

export const config = {
  port: Number(process.env.PORT ?? 3100),
  databaseClient: process.env.DATABASE_CLIENT ?? "sqlite",
  databaseUrl: process.env.DATABASE_URL,
  sqliteDatabasePath: process.env.SQLITE_DATABASE_PATH ?? "record-platform.sqlite",
  databaseCatalogPath: process.env.DATABASE_CATALOG_PATH ?? `${process.env.SQLITE_DATABASE_PATH ?? "record-platform.sqlite"}.catalog.sqlite`,
  databaseDirectory: process.env.DATABASE_DIRECTORY ?? "",
  dbFilter: process.env.DB_FILTER ?? process.env.FILTER_DB ?? "",
  dbName: process.env.DB_NAME ?? process.env.DATABASE_NAME ?? "",
  sqlLog: parseBoolean(process.env.SQL_LOG),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  jwtExpiresSeconds: Number(process.env.JWT_EXPIRES_SECONDS ?? 60 * 60 * 8),
  adminLogin: process.env.ADMIN_LOGIN ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin",
  adminName: process.env.ADMIN_NAME ?? "Administrator",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@example.local",
  websiteBaseUrl: process.env.WEBSITE_BASE_URL ?? `http://localhost:${Number(process.env.PORT ?? 3100)}`,
  nextSiteUrl: process.env.NEXT_SITE_URL ?? "http://localhost:3101",
  attachmentStoragePath: process.env.ATTACHMENT_STORAGE_PATH ?? "storage/attachments",
  minioEndpoint: process.env.MINIO_ENDPOINT ?? "localhost",
  minioPort: Number(process.env.MINIO_PORT ?? 9000),
  minioUseSsl: process.env.MINIO_USE_SSL === "true",
  minioAccessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
  minioSecretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
  minioBucket: process.env.MINIO_BUCKET ?? "record-platform"
};

function parseBoolean(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").toLowerCase());
}

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

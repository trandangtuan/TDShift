import SQLite from "better-sqlite3";
import { existsSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { config } from "./config";
import { createDatabase, type DatabaseLike } from "./database";

export type ManagedDatabase = { name: string; path: string; isDefault: boolean };

const catalog = new SQLite(config.databaseCatalogPath);
const connections = new Map<string, DatabaseLike>();
const defaultName = "main";

function defaultDatabasePath() {
  const configuredPath = resolve(config.sqliteDatabasePath);
  if (!config.databaseDirectory || configuredPath.startsWith(resolve(config.databaseDirectory))) return configuredPath;
  return join(resolve(config.databaseDirectory), "record-platform.sqlite");
}

catalog.exec(`
  CREATE TABLE IF NOT EXISTS platform_database (
    name TEXT PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);
catalog.prepare(`
  INSERT INTO platform_database (name, path, is_default, created_at)
  VALUES (?, ?, 1, ?)
  ON CONFLICT(name) DO UPDATE SET path = excluded.path, is_default = 1
`).run(defaultName, defaultDatabasePath(), new Date().toISOString());

export function getDefaultDatabaseName() {
  return defaultName;
}

export function listDatabases(host?: string): ManagedDatabase[] {
  const databases = catalog.prepare("SELECT name, path, is_default AS isDefault FROM platform_database ORDER BY is_default DESC, name").all() as ManagedDatabase[];
  return databases.filter((database) => isDatabaseAllowed(database.name, host));
}

export function isDatabaseAllowed(name: string, host = "") {
  if (config.dbName && name !== config.dbName) return false;
  if (!config.dbFilter) return true;
  const pattern = config.dbFilter.replaceAll("%d", databaseFromHost(host)).replaceAll("%h", host);
  try {
    return new RegExp(pattern).test(name);
  } catch {
    throw new Error("DB_FILTER must be a valid regular expression");
  }
}

function databaseFromHost(host: string) {
  return host.split(":")[0].split(".")[0] || host;
}

export function hasDatabase(name: string) {
  return Boolean(catalog.prepare("SELECT 1 FROM platform_database WHERE name = ?").get(name));
}

export function getDatabase(name: string) {
  const row = catalog.prepare("SELECT name, path, is_default AS isDefault FROM platform_database WHERE name = ?").get(name) as ManagedDatabase | undefined;
  if (!row) throw new Error("Database not found");
  let connection = connections.get(name);
  if (!connection) {
    connection = createDatabase(row.path);
    connection.pragma("journal_mode = WAL");
    connections.set(name, connection);
  }
  return connection;
}

export function createManagedDatabase(name: string) {
  if ((process.env.DATABASE_CLIENT ?? "sqlite").toLowerCase() !== "sqlite") throw new Error("Database management currently supports SQLite only");
  const normalized = name.trim().toLowerCase();
  if (!/^[a-z][a-z0-9_-]{1,49}$/.test(normalized)) throw new Error("Database name must be 2-50 characters and use letters, numbers, _ or -");
  if (hasDatabase(normalized)) throw new Error("Database already exists");
  const directory = config.databaseDirectory ? resolve(config.databaseDirectory) : dirname(resolve(config.sqliteDatabasePath));
  const path = join(directory, `${normalized}.sqlite`);
  catalog.prepare("INSERT INTO platform_database (name, path, is_default, created_at) VALUES (?, ?, 0, ?)").run(normalized, path, new Date().toISOString());
  return { name: normalized, path, isDefault: false } satisfies ManagedDatabase;
}

export function deleteManagedDatabase(name: string) {
  const row = catalog.prepare("SELECT path, is_default AS isDefault FROM platform_database WHERE name = ?").get(name) as { path: string; isDefault: number } | undefined;
  if (!row) return false;
  if (row.isDefault) throw new Error("The default database cannot be deleted");
  const connection = connections.get(name) as (DatabaseLike & { close?: () => void }) | undefined;
  connection?.close?.();
  connections.delete(name);
  catalog.prepare("DELETE FROM platform_database WHERE name = ?").run(name);
  for (const suffix of ["", "-wal", "-shm"]) if (existsSync(`${row.path}${suffix}`)) unlinkSync(`${row.path}${suffix}`);
  return true;
}

export function assertDatabaseName(name: string, host = "") {
  if (!hasDatabase(name)) throw new Error("Database not found");
  if (!isDatabaseAllowed(name, host)) throw new Error("Database is not allowed by DB_NAME/DB_FILTER");
  return name;
}
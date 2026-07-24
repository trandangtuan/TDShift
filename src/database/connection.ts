import * as SQLite from "expo-sqlite";

let promise: Promise<SQLite.SQLiteDatabase> | undefined;

export function database(): Promise<SQLite.SQLiteDatabase> {
  promise ??= SQLite.openDatabaseAsync("mini-odoo.db");
  return promise;
}

export async function initializeCoreDatabase(): Promise<void> {
  const db = await database();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS ir_module_module (
      name TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      installed_version TEXT,
      state TEXT NOT NULL DEFAULT 'uninstalled',
      installed_at TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ir_model (
      model TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      module TEXT NOT NULL,
      table_name TEXT NOT NULL,
      version INTEGER NOT NULL
    );
  `);
}

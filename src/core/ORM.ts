import type { SQLiteBindValue, SQLiteDatabase } from "expo-sqlite";

import { database } from "../database/connection";
import { Field, Many2manyField, One2manyField } from "./fields";
import { Registry } from "./Registry";
import type { ModelDefinition, ModelValues, RecordId } from "./types";

const systemColumns = new Set(["id", "server_id", "sync_status", "created_at", "updated_at"]);

function ident(value: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) throw new Error(`Tên SQL không hợp lệ: ${value}`);
  return `"${value}"`;
}

function localId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export class ORM {
  constructor(private readonly registry: Registry) {}

  async createSchema(definition: ModelDefinition): Promise<void> {
    const db = await database();
    const columns = Object.entries(definition.fields)
      .filter(([, field]) => field.kind !== "one2many" && field.kind !== "many2many")
      .map(([name, field]) => `${ident(name)} ${field.sqlType()}${field.required ? " NOT NULL" : ""}`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS ${ident(definition.table)} (
      id TEXT PRIMARY KEY NOT NULL,
      server_id INTEGER,
      sync_status TEXT NOT NULL DEFAULT 'created',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL${columns.length ? `, ${columns.join(", ")}` : ""}
    );`);

    for (const [name, field] of Object.entries(definition.fields)) {
      if (field.index && field.kind !== "one2many" && field.kind !== "many2many") {
        await db.execAsync(`CREATE INDEX IF NOT EXISTS ${ident(`idx_${definition.table}_${name}`)} ON ${ident(definition.table)} (${ident(name)});`);
      }
      if (field instanceof Many2manyField) {
        const relation = this.relationTable(definition, name, field);
        await db.execAsync(`CREATE TABLE IF NOT EXISTS ${ident(relation)} (
          source_id TEXT NOT NULL,
          target_id TEXT NOT NULL,
          PRIMARY KEY (source_id, target_id)
        );`);
      }
    }
  }

  async updateSchema(definition: ModelDefinition): Promise<void> {
    const db = await database();
    await this.createSchema(definition);
    const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${ident(definition.table)})`);
    const existing = new Set(columns.map((column) => column.name));
    for (const [name, field] of Object.entries(definition.fields)) {
      if (field.kind === "one2many" || field.kind === "many2many" || existing.has(name)) continue;
      await db.execAsync(`ALTER TABLE ${ident(definition.table)} ADD COLUMN ${ident(name)} ${field.sqlType()};`);
    }
  }

  async dropSchema(definition: ModelDefinition): Promise<void> {
    const db = await database();
    for (const [name, field] of Object.entries(definition.fields)) {
      if (field instanceof Many2manyField) {
        await db.execAsync(`DROP TABLE IF EXISTS ${ident(this.relationTable(definition, name, field))};`);
      }
    }
    await db.execAsync(`DROP TABLE IF EXISTS ${ident(definition.table)};`);
  }

  async searchRead(modelName: string, query: { search?: string; limit?: number; offset?: number } = {}): Promise<ModelValues[]> {
    const definition = this.registry.getDefinition(modelName);
    const db = await database();
    const searchable = Object.entries(definition.fields)
      .filter(([, field]) => field.kind === "char" || field.kind === "text")
      .map(([name]) => `${ident(name)} LIKE ? COLLATE NOCASE`);
    const params: Array<string | number> = [];
    let where = "sync_status <> 'deleted'";
    if (query.search?.trim() && searchable.length) {
      where += ` AND (${searchable.join(" OR ")})`;
      searchable.forEach(() => params.push(`%${query.search!.trim()}%`));
    }
    params.push(query.limit ?? 100, query.offset ?? 0);
    const rows = await db.getAllAsync<ModelValues>(
      `SELECT * FROM ${ident(definition.table)} WHERE ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
      ...params,
    );
    return Promise.all(rows.map((row) => this.hydrate(db, definition, row)));
  }

  async read(modelName: string, id: RecordId): Promise<ModelValues | null> {
    const definition = this.registry.getDefinition(modelName);
    const db = await database();
    const row = await db.getFirstAsync<ModelValues>(
      `SELECT * FROM ${ident(definition.table)} WHERE id = ? AND sync_status <> 'deleted'`, id,
    );
    return row ? this.hydrate(db, definition, row) : null;
  }

  async create(modelName: string, values: ModelValues): Promise<ModelValues> {
    const definition = this.registry.getDefinition(modelName);
    const db = await database();
    const id = localId();
    const now = new Date().toISOString();
    const normalized = this.normalize(definition, values, true);
    const storedEntries = Object.entries(normalized).filter(([name]) => this.isStored(definition.fields[name]));
    const columns = ["id", "sync_status", "created_at", "updated_at", ...storedEntries.map(([name]) => name)];
    const params: SQLiteBindValue[] = [id, "created", now, now, ...storedEntries.map(([name, value]) => definition.fields[name]!.toDatabase(value) as SQLiteBindValue)];
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO ${ident(definition.table)} (${columns.map(ident).join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
        ...params,
      );
      await this.writeMany2many(db, definition, id, normalized);
    });
    return (await this.read(modelName, id))!;
  }

  async write(modelName: string, id: RecordId, values: ModelValues): Promise<ModelValues> {
    const definition = this.registry.getDefinition(modelName);
    const db = await database();
    const current = await this.read(modelName, id);
    if (!current) throw new Error("Bản ghi không tồn tại");
    const normalized = this.normalize(definition, values, false);
    const stored = Object.entries(normalized).filter(([name]) => this.isStored(definition.fields[name]));
    const nextStatus = current.sync_status === "created" ? "created" : "updated";
    await db.withTransactionAsync(async () => {
      if (stored.length) {
        const set = stored.map(([name]) => `${ident(name)} = ?`).join(", ");
        const params = stored.map(([name, value]) => definition.fields[name]!.toDatabase(value) as SQLiteBindValue);
        await db.runAsync(
          `UPDATE ${ident(definition.table)} SET ${set}, sync_status = ?, updated_at = ? WHERE id = ?`,
          ...params, nextStatus, new Date().toISOString(), id,
        );
      }
      await this.writeMany2many(db, definition, id, normalized);
    });
    return (await this.read(modelName, id))!;
  }

  async unlink(modelName: string, id: RecordId): Promise<void> {
    const definition = this.registry.getDefinition(modelName);
    const db = await database();
    const row = await db.getFirstAsync<{ server_id: number | null; sync_status: string }>(
      `SELECT server_id, sync_status FROM ${ident(definition.table)} WHERE id = ?`, id,
    );
    if (!row) return;
    if (row.server_id == null && row.sync_status === "created") {
      await db.runAsync(`DELETE FROM ${ident(definition.table)} WHERE id = ?`, id);
    } else {
      await db.runAsync(`UPDATE ${ident(definition.table)} SET sync_status = 'deleted', updated_at = ? WHERE id = ?`, new Date().toISOString(), id);
    }
  }

  private normalize(definition: ModelDefinition, values: ModelValues, includeDefaults: boolean): ModelValues {
    const output: ModelValues = {};
    for (const [name, field] of Object.entries(definition.fields)) {
      let value = values[name];
      if (value === undefined && includeDefaults) value = field.getDefault();
      if (value === undefined) continue;
      if (field.readonly && values[name] !== undefined) throw new Error(`${field.string || name} là trường chỉ đọc`);
      if (field.required && (value === null || value === "")) throw new Error(`${field.string || name} là bắt buộc`);
      output[name] = value;
    }
    return output;
  }

  private isStored(field?: Field): boolean {
    return Boolean(field && !(field instanceof Many2manyField) && !(field instanceof One2manyField));
  }

  private relationTable(definition: ModelDefinition, name: string, field: Many2manyField): string {
    return field.relation ?? `${definition.table}_${name}_rel`;
  }

  private async writeMany2many(db: SQLiteDatabase, definition: ModelDefinition, id: string, values: ModelValues): Promise<void> {
    for (const [name, field] of Object.entries(definition.fields)) {
      if (!(field instanceof Many2manyField) || values[name] === undefined) continue;
      const relation = this.relationTable(definition, name, field);
      await db.runAsync(`DELETE FROM ${ident(relation)} WHERE source_id = ?`, id);
      for (const targetId of values[name] as string[]) {
        await db.runAsync(`INSERT INTO ${ident(relation)} (source_id, target_id) VALUES (?, ?)`, id, targetId);
      }
    }
  }

  private async hydrate(db: SQLiteDatabase, definition: ModelDefinition, row: ModelValues): Promise<ModelValues> {
    const output = { ...row };
    for (const [name, field] of Object.entries(definition.fields)) {
      if (this.isStored(field)) output[name] = field.fromDatabase(row[name]);
      if (field instanceof Many2manyField) {
        const relations = await db.getAllAsync<{ target_id: string }>(
          `SELECT target_id FROM ${ident(this.relationTable(definition, name, field))} WHERE source_id = ?`, row.id as string,
        );
        output[name] = relations.map((item) => item.target_id);
      }
      if (field instanceof One2manyField && this.registry.hasModel(field.comodelName)) {
        const target = this.registry.getDefinition(field.comodelName);
        const children = await db.getAllAsync<{ id: string }>(
          `SELECT id FROM ${ident(target.table)} WHERE ${ident(field.inverseName)} = ? AND sync_status <> 'deleted'`, row.id as string,
        );
        output[name] = children.map((item) => item.id);
      }
    }
    return output;
  }
}

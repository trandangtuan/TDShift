import Database from "better-sqlite3";
import type { FieldDefinition, ModuleDefinition } from "@record-platform/core";

export const db = new Database("record-platform.sqlite");
db.pragma("journal_mode = WAL");

export const auditFields: FieldDefinition[] = [
  { name: "create_uid", label: "Created By", type: "many2one", relationModel: "core.user", readonly: true, sequence: 900 },
  { name: "write_uid", label: "Last Updated By", type: "many2one", relationModel: "core.user", readonly: true, sequence: 910 },
  { name: "create_date", label: "Created At", type: "datetime", readonly: true, sequence: 920 },
  { name: "write_date", label: "Last Updated At", type: "datetime", readonly: true, sequence: 930 }
];
const auditFieldNames = new Set(auditFields.map((field) => field.name));

const systemTables = [
  `CREATE TABLE IF NOT EXISTS core_module (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technical_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    state TEXT NOT NULL,
    installable INTEGER NOT NULL,
    auto_install INTEGER NOT NULL,
    sequence INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS core_module_dependency (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    depends_on TEXT NOT NULL,
    UNIQUE(module, depends_on)
  )`,
  `CREATE TABLE IF NOT EXISTS core_model (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technical_name TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    table_name TEXT NOT NULL,
    module TEXT NOT NULL,
    owner_module TEXT NOT NULL,
    is_abstract INTEGER NOT NULL,
    is_transient INTEGER NOT NULL,
    is_system INTEGER NOT NULL,
    is_custom INTEGER NOT NULL,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS core_model_field (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    module TEXT NOT NULL,
    owner_module TEXT NOT NULL,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL,
    required INTEGER NOT NULL,
    readonly INTEGER NOT NULL,
    indexed INTEGER NOT NULL,
    stored INTEGER NOT NULL,
    unique_flag INTEGER NOT NULL,
    relation_model TEXT,
    inverse_field TEXT,
    default_value TEXT,
    compute_method TEXT,
    related_path TEXT,
    selection_options TEXT,
    sequence INTEGER NOT NULL,
    is_system INTEGER NOT NULL,
    is_custom INTEGER NOT NULL,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(model, name)
  )`,
  `CREATE TABLE IF NOT EXISTS core_view (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technical_name TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    type TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'json',
    content TEXT,
    architecture TEXT NOT NULL,
    priority INTEGER NOT NULL,
    module TEXT NOT NULL,
    owner_module TEXT NOT NULL,
    parent_view TEXT,
    is_system INTEGER NOT NULL,
    is_custom INTEGER NOT NULL,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS core_view_extension (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technical_name TEXT NOT NULL UNIQUE,
    target_view TEXT NOT NULL,
    operation TEXT NOT NULL,
    target TEXT NOT NULL,
    content TEXT NOT NULL,
    priority INTEGER NOT NULL,
    module TEXT NOT NULL,
    owner_module TEXT NOT NULL,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS core_action (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technical_name TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    model TEXT,
    view_modes TEXT,
    domain TEXT,
    context TEXT,
    target TEXT,
    module TEXT NOT NULL,
    owner_module TEXT NOT NULL,
    is_system INTEGER NOT NULL,
    is_custom INTEGER NOT NULL,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS core_menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technical_name TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    parent TEXT,
    action TEXT,
    icon TEXT,
    sequence INTEGER NOT NULL,
    module TEXT NOT NULL,
    owner_module TEXT NOT NULL,
    is_system INTEGER NOT NULL,
    is_custom INTEGER NOT NULL,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS core_external_id (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    name TEXT NOT NULL,
    complete_name TEXT NOT NULL UNIQUE,
    resource_type TEXT NOT NULL,
    resource_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS core_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,
    token_version INTEGER NOT NULL DEFAULT 0,
    api_token TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`
];

export function initializeSystemSchema() {
  for (const sql of systemTables) db.prepare(sql).run();
  ensureColumn("core_view", "content_type", "TEXT NOT NULL DEFAULT 'json'");
  ensureColumn("core_view", "content", "TEXT");
  db.prepare("UPDATE core_view SET content_type = COALESCE(content_type, 'json'), content = COALESCE(content, architecture)").run();
  for (const table of systemTableNames) ensureAuditColumns(table);
  for (const table of systemTableNames) backfillAuditColumns(table);
}

export function syncBusinessTable(model: { tableName: string; fields: FieldDefinition[] }) {
  db.prepare(`CREATE TABLE IF NOT EXISTS ${quoteIdent(model.tableName)} (id INTEGER PRIMARY KEY AUTOINCREMENT)`).run();
  const existing = new Set(db.prepare(`PRAGMA table_info(${quoteIdent(model.tableName)})`).all().map((row: any) => row.name));
  for (const field of model.fields) {
    if (field.stored === false || existing.has(field.name)) continue;
    db.prepare(`ALTER TABLE ${quoteIdent(model.tableName)} ADD COLUMN ${quoteIdent(field.name)} ${sqliteType(field)}`).run();
  }
  ensureAuditColumns(model.tableName);
}

export function bootstrapModules(modules: ModuleDefinition[], options: { forceInstall?: boolean; applyMetadata?: boolean } = {}) {
  initializeSystemSchema();
  const now = new Date().toISOString();
  const discoverModule = db.prepare(`
    INSERT INTO core_module (technical_name, display_name, version, description, state, installable, auto_install, sequence, created_at, updated_at)
    VALUES (@technicalName, @displayName, @version, @description, 'UNINSTALLED', @installable, @autoInstall, @sequence, @now, @now)
    ON CONFLICT(technical_name) DO NOTHING
  `);
  const updateModuleFromCode = db.prepare(`
    UPDATE core_module
    SET display_name = @displayName,
        version = @version,
        description = @description,
        installable = @installable,
        auto_install = @autoInstall,
        sequence = @sequence,
        updated_at = @now
    WHERE technical_name = @technicalName
  `);
  const shouldApplyMetadata = Boolean(options.forceInstall || options.applyMetadata);
  for (const mod of modules) {
    const moduleParams = { ...mod, description: mod.description ?? null, installable: mod.installable === false ? 0 : 1, autoInstall: mod.autoInstall ? 1 : 0, sequence: mod.sequence ?? 100, now };
    discoverModule.run(moduleParams);
    if (shouldApplyMetadata) updateModuleFromCode.run(moduleParams);
    if (options.forceInstall) {
      db.prepare("UPDATE core_module SET state = 'INSTALLED', updated_at = ? WHERE technical_name = ?").run(now, mod.technicalName);
      setModuleRecordsActive(mod.technicalName, true);
    }
    if (!shouldApplyMetadata) continue;
    const moduleRow = db.prepare("SELECT state FROM core_module WHERE technical_name = ?").get(mod.technicalName) as { state: string };
    if (moduleRow.state !== "INSTALLED") continue;
    for (const dep of mod.depends ?? []) {
      db.prepare("INSERT OR IGNORE INTO core_module_dependency (module, depends_on) VALUES (?, ?)").run(mod.technicalName, dep);
    }
    for (const model of mod.models ?? []) {
      const existing = db.prepare("SELECT owner_module FROM core_model WHERE technical_name = ?").get(model.technicalName) as { owner_module: string } | undefined;
      if (!existing) {
        db.prepare(`
          INSERT INTO core_model (technical_name, name, table_name, module, owner_module, is_abstract, is_transient, is_system, is_custom, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)
        `).run(model.technicalName, model.name, model.tableName, mod.technicalName, mod.technicalName, model.isAbstract ? 1 : 0, model.isTransient ? 1 : 0, mod.technicalName === "base" ? 1 : 0, now, now);
      } else if (existing.owner_module === mod.technicalName || shouldTransferModelOwnership(model)) {
        db.prepare(`
          UPDATE core_model
          SET name = ?,
              table_name = ?,
              module = ?,
              is_abstract = ?,
              is_transient = ?,
              is_system = ?,
              is_custom = 0,
              is_active = 1,
              updated_at = ?
          WHERE technical_name = ?
        `).run(model.name, model.tableName, mod.technicalName, model.isAbstract ? 1 : 0, model.isTransient ? 1 : 0, mod.technicalName === "base" ? 1 : 0, now, model.technicalName);
      }
      syncBusinessTable(model);
      for (const field of model.fields) upsertField(mod, model.technicalName, field, now);
      upsertAuditFields(model.technicalName, now);
    }
    for (const view of mod.views ?? []) {
      const architecture = JSON.stringify(view.architecture);
      db.prepare(`
        INSERT INTO core_view (technical_name, name, model, type, content_type, content, architecture, priority, module, owner_module, parent_view, is_system, is_custom, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 0, 1, ?, ?)
        ON CONFLICT(technical_name) DO UPDATE SET name=excluded.name, model=excluded.model, type=excluded.type, content_type=excluded.content_type, content=excluded.content, architecture=excluded.architecture, priority=excluded.priority, module=excluded.module, is_system=excluded.is_system, is_custom=0, is_active=1, updated_at=excluded.updated_at
      `).run(view.technicalName, view.name, view.model, view.type, view.contentType ?? "json", view.content ?? architecture, architecture, view.priority ?? 16, mod.technicalName, mod.technicalName, mod.technicalName === "base" ? 1 : 0, now, now);
    }
    for (const ext of mod.viewExtensions ?? []) {
      db.prepare(`
        INSERT INTO core_view_extension (technical_name, target_view, operation, target, content, priority, module, owner_module, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(technical_name) DO UPDATE SET target_view=excluded.target_view, operation=excluded.operation, target=excluded.target, content=excluded.content, priority=excluded.priority, module=excluded.module, is_active=1, updated_at=excluded.updated_at
      `).run(ext.technicalName, ext.targetView, ext.operation, ext.target, JSON.stringify(ext.content), ext.priority ?? 100, mod.technicalName, mod.technicalName, now, now);
    }
    for (const action of mod.actions ?? []) {
      db.prepare(`
        INSERT INTO core_action (technical_name, name, type, model, view_modes, domain, context, target, module, owner_module, is_system, is_custom, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)
        ON CONFLICT(technical_name) DO UPDATE SET name=excluded.name, type=excluded.type, model=excluded.model, view_modes=excluded.view_modes, domain=excluded.domain, context=excluded.context, target=excluded.target, module=excluded.module, is_system=excluded.is_system, is_custom=0, is_active=1, updated_at=excluded.updated_at
      `).run(action.technicalName, action.name, action.type, action.model ?? null, JSON.stringify(action.viewModes ?? []), JSON.stringify(action.domain ?? []), JSON.stringify(action.context ?? {}), action.target ?? "current", mod.technicalName, mod.technicalName, mod.technicalName === "base" ? 1 : 0, now, now);
    }
    for (const menu of mod.menus ?? []) {
      db.prepare(`
        INSERT INTO core_menu (technical_name, name, parent, action, icon, sequence, module, owner_module, is_system, is_custom, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)
        ON CONFLICT(technical_name) DO UPDATE SET name=excluded.name, parent=excluded.parent, action=excluded.action, icon=excluded.icon, sequence=excluded.sequence, module=excluded.module, is_system=excluded.is_system, is_custom=0, is_active=1, updated_at=excluded.updated_at
      `).run(menu.technicalName, menu.name, menu.parent ?? null, menu.action ?? null, menu.icon ?? null, menu.sequence ?? 100, mod.technicalName, mod.technicalName, mod.technicalName === "base" ? 1 : 0, now, now);
    }
    reconcileModuleMetadata(mod, now);
  }
  insertExternalIds(now);
  for (const mod of modules) for (const record of mod.data ?? []) seedData(record.model, record.values);
  backfillAllAuditColumns();
}

export function installModuleRecords(moduleName: string) {
  const now = new Date().toISOString();
  db.prepare("UPDATE core_module SET state = 'INSTALLED', updated_at = ? WHERE technical_name = ?").run(now, moduleName);
  setModuleRecordsActive(moduleName, true);
}

export function uninstallModuleAndDropOwnedFields(moduleName: string) {
  if (moduleName === "base") throw new Error("The base module cannot be uninstalled.");
  const blocking = db.prepare("SELECT module FROM core_module_dependency JOIN core_module ON core_module.technical_name = core_module_dependency.module WHERE depends_on = ? AND state = 'INSTALLED'").all(moduleName) as Array<{ module: string }>;
  if (blocking.length) {
    throw new Error(`Cannot uninstall ${moduleName}; installed modules depend on it: ${blocking.map((row) => row.module).join(", ")}`);
  }
  const now = new Date().toISOString();
  db.transaction(() => {
    dropOwnedFieldColumns(moduleName);
    deleteModuleMetadata(moduleName);
    db.prepare("UPDATE core_module SET state = 'UNINSTALLED', updated_at = ? WHERE technical_name = ?").run(now, moduleName);
  })();
}

function dropOwnedFieldColumns(moduleName: string) {
  const fields = db.prepare(`
    SELECT core_model.table_name, core_model_field.name
    FROM core_model_field
    JOIN core_model ON core_model.technical_name = core_model_field.model
    WHERE core_model_field.owner_module = ?
      AND core_model_field.stored = 1
      AND core_model.owner_module != ?
  `).all(moduleName, moduleName) as Array<{ table_name: string; name: string }>;

  for (const field of fields) {
    dropColumnIfExists(field.table_name, field.name);
  }
}

function deleteModuleMetadata(moduleName: string) {
  db.prepare("DELETE FROM core_external_id WHERE module = ? AND resource_type != 'core.module'").run(moduleName);
  db.prepare("DELETE FROM core_view_extension WHERE owner_module = ?").run(moduleName);
  db.prepare("DELETE FROM core_menu WHERE owner_module = ? AND is_custom = 0").run(moduleName);
  db.prepare("DELETE FROM core_action WHERE owner_module = ? AND is_custom = 0").run(moduleName);
  db.prepare("DELETE FROM core_view WHERE owner_module = ? AND is_custom = 0").run(moduleName);
  db.prepare("DELETE FROM core_model_field WHERE owner_module = ? AND is_custom = 0").run(moduleName);
  db.prepare("DELETE FROM core_model WHERE owner_module = ? AND is_custom = 0").run(moduleName);
}

function reconcileModuleMetadata(mod: ModuleDefinition, now: string) {
  const moduleName = mod.technicalName;
  const activeModels = new Set((mod.models ?? []).map((model) => model.technicalName));
  for (const model of mod.models ?? []) {
    const activeFields = new Set(model.fields.map((field) => field.name));
    const staleFields = db.prepare(`
      SELECT core_model.table_name, core_model_field.model, core_model_field.name, core_model_field.stored
      FROM core_model_field
      JOIN core_model ON core_model.technical_name = core_model_field.model
      WHERE core_model_field.owner_module = ?
        AND core_model_field.model = ?
        AND core_model_field.is_custom = 0
        AND core_model_field.is_active = 1
    `).all(moduleName, model.technicalName) as Array<{ table_name: string; model: string; name: string; stored: number }>;

    for (const field of staleFields) {
      if (activeFields.has(field.name)) continue;
      if (auditFieldNames.has(field.name)) continue;
      if (field.stored) dropColumnIfExists(field.table_name, field.name);
      db.prepare(`
        UPDATE core_model_field
        SET is_active = 0, updated_at = ?
        WHERE owner_module = ? AND model = ? AND name = ? AND is_custom = 0
      `).run(now, moduleName, field.model, field.name);
    }
  }

  deactivateMissing("core_model", "technical_name", moduleName, activeModels, now);
  deactivateMissing("core_view", "technical_name", moduleName, new Set((mod.views ?? []).map((view) => view.technicalName)), now);
  deactivateMissing("core_view_extension", "technical_name", moduleName, new Set((mod.viewExtensions ?? []).map((view) => view.technicalName)), now, false);
  deactivateMissing("core_action", "technical_name", moduleName, new Set((mod.actions ?? []).map((action) => action.technicalName)), now);
  deactivateMissing("core_menu", "technical_name", moduleName, new Set((mod.menus ?? []).map((menu) => menu.technicalName)), now);
}

function deactivateMissing(table: string, keyColumn: string, moduleName: string, activeKeys: Set<string>, now: string, hasCustomFlag = true) {
  const customFilter = hasCustomFlag ? "AND is_custom = 0" : "";
  const rows = db.prepare(`
    SELECT ${quoteIdent(keyColumn)} AS key
    FROM ${quoteIdent(table)}
    WHERE owner_module = ? ${customFilter} AND is_active = 1
  `).all(moduleName) as Array<{ key: string }>;

  for (const row of rows) {
    if (activeKeys.has(row.key)) continue;
    db.prepare(`
      UPDATE ${quoteIdent(table)}
      SET is_active = 0, updated_at = ?
      WHERE owner_module = ? AND ${quoteIdent(keyColumn)} = ? ${customFilter}
    `).run(now, moduleName, row.key);
  }
}

function dropColumnIfExists(tableName: string, columnName: string) {
  const columns = new Set((db.prepare(`PRAGMA table_info(${quoteIdent(tableName)})`).all() as Array<{ name: string }>).map((column) => column.name));
  if (!columns.has(columnName)) return;
  db.prepare(`ALTER TABLE ${quoteIdent(tableName)} DROP COLUMN ${quoteIdent(columnName)}`).run();
}

function setModuleRecordsActive(moduleName: string, active: boolean) {
  const value = active ? 1 : 0;
  for (const table of ["core_model", "core_model_field", "core_view", "core_view_extension", "core_action", "core_menu"]) {
    db.prepare(`UPDATE ${table} SET is_active = ? WHERE owner_module = ?`).run(value, moduleName);
  }
}

function upsertField(mod: ModuleDefinition, model: string, field: FieldDefinition, now: string) {
  db.prepare(`
    INSERT INTO core_model_field (model, module, owner_module, name, label, type, required, readonly, indexed, stored, unique_flag, relation_model, inverse_field, default_value, compute_method, related_path, selection_options, sequence, is_system, is_custom, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)
    ON CONFLICT(model, name) DO UPDATE SET module=excluded.module, owner_module=excluded.owner_module, label=excluded.label, type=excluded.type, required=excluded.required, readonly=excluded.readonly, indexed=excluded.indexed, stored=excluded.stored, unique_flag=excluded.unique_flag, relation_model=excluded.relation_model, inverse_field=excluded.inverse_field, default_value=excluded.default_value, compute_method=excluded.compute_method, related_path=excluded.related_path, selection_options=excluded.selection_options, sequence=excluded.sequence, is_system=excluded.is_system, is_custom=0, is_active=1, updated_at=excluded.updated_at
  `).run(model, mod.technicalName, mod.technicalName, field.name, field.label, field.type, field.required ? 1 : 0, field.readonly ? 1 : 0, field.indexed ? 1 : 0, field.stored === false ? 0 : 1, field.unique ? 1 : 0, field.relationModel ?? null, field.inverseField ?? null, JSON.stringify(field.defaultValue ?? null), field.computeMethod ?? null, field.relatedPath ?? null, JSON.stringify(field.selectionOptions ?? null), field.sequence ?? 100, mod.technicalName === "base" ? 1 : 0, now, now);
}

function upsertAuditFields(model: string, now: string) {
  for (const field of auditFields) upsertField({ technicalName: "base", displayName: "Base", version: "1.0.0" }, model, field, now);
}

function shouldTransferModelOwnership(model: { fields: FieldDefinition[] }) {
  return model.fields.some((field) => field.stored !== false && !auditFieldNames.has(field.name) && (field.required || field.name === "name"));
}

function insertExternalIds(now: string) {
  const mappings = [
    ["core_module", "core.module", "technical_name"],
    ["core_model", "core.model", "technical_name"],
    ["core_model_field", "core.model.field", "module || '.field_' || replace(replace(model, '.', '_'), '-', '_') || '_' || name"],
    ["core_view", "core.view", "technical_name"],
    ["core_action", "core.action", "technical_name"],
    ["core_menu", "core.menu", "technical_name"]
  ] as const;
  for (const [table, type, nameExpr] of mappings) {
    const moduleExpr = table === "core_module" ? "technical_name" : "module";
    const rows = db.prepare(`SELECT id, ${moduleExpr} AS module, ${nameExpr} AS complete_name FROM ${table}`).all() as Array<{ id: number; module: string; complete_name: string }>;
    for (const row of rows) {
      const name = row.complete_name.includes(".") ? row.complete_name.split(".").slice(1).join(".") : row.complete_name;
      db.prepare(`
        INSERT INTO core_external_id (module, name, complete_name, resource_type, resource_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(complete_name) DO UPDATE SET resource_id=excluded.resource_id, updated_at=excluded.updated_at
      `).run(row.module, name, row.complete_name, type, row.id, now, now);
    }
  }
}

function seedData(modelName: string, values: Record<string, unknown>) {
  const model = db.prepare("SELECT table_name FROM core_model WHERE technical_name = ?").get(modelName) as { table_name: string } | undefined;
  if (!model) return;
  const tableColumns = new Set((db.prepare(`PRAGMA table_info(${quoteIdent(model.table_name)})`).all() as Array<{ name: string }>).map((column) => column.name));
  const fields = db.prepare("SELECT name, type FROM core_model_field WHERE model = ?").all(modelName) as Array<{ name: string; type: string }>;
  const types = new Map(fields.map((field) => [field.name, field.type]));
  const normalized = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, types.get(key) === "boolean" ? (value ? 1 : 0) : types.get(key) === "json" ? JSON.stringify(value) : value])
  );
  const uniqueColumns = "name" in normalized && tableColumns.has("name") ? ["name"] : Object.keys(normalized).filter((column) => tableColumns.has(column));
  if (uniqueColumns.length) {
    const where = uniqueColumns.map((column) => `${quoteIdent(column)} = @${column}`).join(" AND ");
    const existing = db.prepare(`SELECT id FROM ${quoteIdent(model.table_name)} WHERE ${where}`).get(normalized) as { id: number } | undefined;
    if (existing) {
      backfillMissingSeedValues(model.table_name, existing.id, normalized, tableColumns);
      return;
    }
  }
  const withAudit = withAuditDefaults(normalized, tableColumns);
  const insertColumns = Object.keys(withAudit);
  const insertParams = insertColumns.map((column) => `@${column}`).join(", ");
  db.prepare(`INSERT INTO ${quoteIdent(model.table_name)} (${insertColumns.map(quoteIdent).join(", ")}) VALUES (${insertParams})`).run(withAudit);
}

function backfillMissingSeedValues(tableName: string, id: number, values: Record<string, unknown>, tableColumns: Set<string>) {
  const updateValues = Object.fromEntries(Object.entries(values).filter(([column, value]) => tableColumns.has(column) && value !== null && value !== undefined));
  const assignments = Object.keys(updateValues).map((column) => `${quoteIdent(column)} = COALESCE(${quoteIdent(column)}, @${column})`);
  if (!assignments.length) return;
  db.prepare(`UPDATE ${quoteIdent(tableName)} SET ${assignments.join(", ")} WHERE id = @id`).run({ ...updateValues, id });
}

export function quoteIdent(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function sqliteType(field: FieldDefinition) {
  if (["integer", "many2one"].includes(field.type)) return "INTEGER";
  if (field.type === "decimal") return "REAL";
  if (field.type === "boolean") return "INTEGER";
  return "TEXT";
}

const systemTableNames = [
  "core_module",
  "core_module_dependency",
  "core_model",
  "core_model_field",
  "core_view",
  "core_view_extension",
  "core_action",
  "core_menu",
  "core_external_id",
  "core_user"
];

function ensureAuditColumns(tableName: string) {
  const columns = new Set((db.prepare(`PRAGMA table_info(${quoteIdent(tableName)})`).all() as Array<{ name: string }>).map((column) => column.name));
  for (const field of auditFields) {
    if (columns.has(field.name)) continue;
    db.prepare(`ALTER TABLE ${quoteIdent(tableName)} ADD COLUMN ${quoteIdent(field.name)} ${sqliteType(field)}`).run();
  }
}

function ensureColumn(tableName: string, columnName: string, typeSql: string) {
  const columns = new Set((db.prepare(`PRAGMA table_info(${quoteIdent(tableName)})`).all() as Array<{ name: string }>).map((column) => column.name));
  if (columns.has(columnName)) return;
  db.prepare(`ALTER TABLE ${quoteIdent(tableName)} ADD COLUMN ${quoteIdent(columnName)} ${typeSql}`).run();
}

function backfillAllAuditColumns() {
  const rows = db.prepare("SELECT table_name FROM core_model WHERE is_active = 1").all() as Array<{ table_name: string }>;
  const tables = new Set([...systemTableNames, ...rows.map((row) => row.table_name)]);
  for (const table of tables) backfillAuditColumns(table);
}

function backfillAuditColumns(tableName: string) {
  const columns = new Set((db.prepare(`PRAGMA table_info(${quoteIdent(tableName)})`).all() as Array<{ name: string }>).map((column) => column.name));
  if (!["create_uid", "write_uid", "create_date", "write_date"].every((column) => columns.has(column))) return;
  const now = new Date().toISOString();
  const createDateFallback = ["create_date", columns.has("created_at") ? "created_at" : null, columns.has("updated_at") ? "updated_at" : null].filter(Boolean).join(", ");
  const writeDateFallback = ["write_date", columns.has("updated_at") ? "updated_at" : null, columns.has("created_at") ? "created_at" : null].filter(Boolean).join(", ");
  db.prepare(`
    UPDATE ${quoteIdent(tableName)}
    SET create_uid = COALESCE(create_uid, 1),
        write_uid = COALESCE(write_uid, create_uid, 1),
        create_date = COALESCE(${createDateFallback}, ?),
        write_date = COALESCE(${writeDateFallback}, ?)
  `).run(now, now);
}

function withAuditDefaults(values: Record<string, unknown>, tableColumns: Set<string>, userId = 1) {
  const now = new Date().toISOString();
  return {
    ...values,
    ...(tableColumns.has("create_uid") && !("create_uid" in values) ? { create_uid: userId } : {}),
    ...(tableColumns.has("write_uid") && !("write_uid" in values) ? { write_uid: userId } : {}),
    ...(tableColumns.has("create_date") && !("create_date" in values) ? { create_date: now } : {}),
    ...(tableColumns.has("write_date") && !("write_date" in values) ? { write_date: now } : {})
  };
}

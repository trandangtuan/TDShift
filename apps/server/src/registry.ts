import type {
  Domain,
  Environment,
  FieldDefinition,
  ModelRuntime,
  RuntimeAction,
  RuntimeMenu,
  RuntimeModel,
  RuntimeRegistry,
  RuntimeView,
  ViewNode
} from "@record-platform/core";
import { hashPassword } from "./auth";
import { storeAttachmentPayload } from "./attachments";
import { config } from "./config";
import { db, quoteIdent } from "./db";
import { moduleDefinitions } from "./modules";

export function buildRegistry(): RuntimeRegistry {
  const models = new Map<string, RuntimeModel>();
  const modelRows = db.prepare("SELECT * FROM core_model WHERE is_active = 1").all() as any[];
  const fieldRows = db.prepare("SELECT * FROM core_model_field WHERE is_active = 1 ORDER BY model, sequence, id").all() as any[];
  const fieldsByModel = new Map<string, FieldDefinition[]>();
  for (const row of fieldRows) {
    const fields = fieldsByModel.get(row.model) ?? [];
    fields.push(rowToField(row));
    fieldsByModel.set(row.model, fields);
  }
  for (const row of modelRows) {
    models.set(row.technical_name, {
      technicalName: row.technical_name,
      name: row.name,
      tableName: row.table_name,
      module: row.module,
      isAbstract: Boolean(row.is_abstract),
      isTransient: Boolean(row.is_transient),
      fields: fieldsByModel.get(row.technical_name) ?? [],
      methods: new Map()
    });
  }

  for (const mod of moduleDefinitions) {
    for (const model of mod.models ?? []) {
      const runtimeModel = models.get(model.technicalName);
      if (!runtimeModel) continue;
      for (const [name, method] of Object.entries(model.methods ?? {})) {
        const chain = runtimeModel.methods.get(name) ?? [];
        chain.push(method);
        runtimeModel.methods.set(name, chain);
      }
      for (const ext of model.extensions ?? []) {
        const target = models.get(ext.model);
        if (!target) continue;
        const chain = target.methods.get(ext.method) ?? [];
        chain.unshift(ext.handler);
        target.methods.set(ext.method, chain);
      }
    }
  }

  const views = new Map<string, RuntimeView>();
  const viewRows = db.prepare("SELECT * FROM core_view WHERE is_active = 1").all() as any[];
  for (const row of viewRows) {
    views.set(row.technical_name, {
      technicalName: row.technical_name,
      name: row.name,
      model: row.model,
      type: row.type,
      contentType: row.content_type ?? "json",
      content: row.content ?? row.architecture,
      priority: row.priority,
      architecture: applyViewExtensions(row.technical_name, JSON.parse(row.architecture)),
      module: row.module
    });
  }

  const actions = new Map<string, RuntimeAction>();
  const actionRows = db.prepare("SELECT * FROM core_action WHERE is_active = 1").all() as any[];
  for (const row of actionRows) {
    actions.set(row.technical_name, {
      technicalName: row.technical_name,
      name: row.name,
      type: row.type,
      model: row.model,
      viewModes: JSON.parse(row.view_modes ?? "[]"),
      domain: JSON.parse(row.domain ?? "[]"),
      context: JSON.parse(row.context ?? "{}"),
      target: row.target,
      module: row.module
    });
  }

  return { models, views, actions, menus: buildMenus() };
}

export function createEnvironment(registry: RuntimeRegistry, context: Record<string, unknown> = {}, user: Environment["user"] = { id: 1, login: "admin", name: "Administrator" }): Environment {
  const env: Environment = {
    user,
    context,
    registry,
    model(name: string) {
      const model = registry.models.get(name);
      if (!model) throw new Error(`Unknown model: ${name}`);
      return createModelRuntime(env, model);
    },
    withContext(extra: Record<string, unknown>) {
      return createEnvironment(registry, { ...context, ...extra }, user);
    }
  };
  return env;
}

function createModelRuntime(env: Environment, model: RuntimeModel): ModelRuntime {
  return {
    async search(domain: Domain = [], options: { limit?: number; offset?: number } = {}) {
      const { sql, params } = domainToSql(domain);
      const limit = options.limit && options.limit > 0 ? ` LIMIT ${Math.min(options.limit, 100)}` : "";
      const offset = options.offset && options.offset > 0 ? ` OFFSET ${Math.max(0, options.offset)}` : "";
      const rows = db.prepare(`SELECT id FROM ${quoteIdent(model.tableName)} ${sql} ORDER BY id DESC${limit}${limit ? offset : ""}`).all(...params) as Array<{ id: number }>;
      return rows.map((row) => row.id);
    },
    async read(ids, fields) {
      if (ids.length === 0) return [];
      const storedFields = model.fields.filter((field) => field.stored !== false);
      const requestedFields = fields?.length ? fields : model.fields.map((field) => field.name);
      const selected = unique(["id", ...requestedFields.filter((fieldName) => storedFields.some((field) => field.name === fieldName))]);
      const rows = db.prepare(`SELECT ${selected.map(quoteIdent).join(", ")} FROM ${quoteIdent(model.tableName)} WHERE id IN (${ids.map(() => "?").join(", ")})`).all(...ids);
      const records = rows.map((row: any) => deserializeRow(model, row));
      await applyComputedFields(env, model, records, requestedFields);
      await enrichManyToOneValues(env, model, records, requestedFields);
      return records;
    },
    async searchRead(domain: Domain = [], fields, options: { limit?: number; offset?: number } = {}) {
      const ids = await this.search(domain, options);
      const rows = await this.read(ids, fields);
      const order = new Map(ids.map((id, index) => [id, index]));
      return rows.sort((left, right) => (order.get(Number(left.id)) ?? 0) - (order.get(Number(right.id)) ?? 0));
    },
    async create(values) {
      if (model.technicalName === "ir.attachment") values = await storeAttachmentPayload(values);
      const normalized = withCreateAuditDefaults(model, withTableDefaults(model, withMetadataDefaults(model.tableName, normalizeValues(model, values)), true), env.user.id);
      const columns = Object.keys(normalized);
      const result = db.prepare(`INSERT INTO ${quoteIdent(model.tableName)} (${columns.map(quoteIdent).join(", ")}) VALUES (${columns.map((column) => `@${column}`).join(", ")})`).run(normalized);
      const id = Number(result.lastInsertRowid);
      await callOptionalModelMethod(env, model, "after_create", [id], { values });
      return id;
    },
    async write(ids, values) {
      if (ids.length === 0) return;
      if (model.technicalName === "ir.attachment") values = await storeAttachmentPayload(values);
      const previousRecords = hasMethod(model, "after_write") ? await this.read(ids) : [];
      const normalized = withWriteAuditDefaults(model, withTableDefaults(model, normalizeValues(model, values), false), env.user.id);
      const assignments = Object.keys(normalized).map((column) => `${quoteIdent(column)} = @${column}`).join(", ");
      db.prepare(`UPDATE ${quoteIdent(model.tableName)} SET ${assignments} WHERE id IN (${ids.map((_, index) => `@id${index}`).join(", ")})`).run({ ...normalized, ...Object.fromEntries(ids.map((id, index) => [`id${index}`, id])) });
      await callOptionalModelMethod(env, model, "after_write", ids, { values, args: [previousRecords] });
    },
    async unlink(ids) {
      if (ids.length === 0) return;
      const previousRecords = hasMethod(model, "after_unlink") ? await this.read(ids) : [];
      db.prepare(`DELETE FROM ${quoteIdent(model.tableName)} WHERE id IN (${ids.map(() => "?").join(", ")})`).run(...ids);
      await callOptionalModelMethod(env, model, "after_unlink", ids, { args: [previousRecords] });
    },
    async call(method, ids, args = []) {
      const chain = model.methods.get(method);
      if (!chain?.length) throw new Error(`Unknown method ${model.technicalName}.${method}`);
      let index = -1;
      const dispatch = async (): Promise<unknown> => {
        index += 1;
        const fn = chain[index];
        if (!fn) return undefined;
        return fn({ env, model: model.technicalName, ids, args }, dispatch);
      };
      return dispatch();
    }
  };
}

async function callOptionalModelMethod(env: Environment, model: RuntimeModel, method: string, ids: number[], options: { values?: Record<string, unknown>; args?: unknown[] } = {}) {
  const chain = model.methods.get(method);
  if (!chain?.length) return;
  let index = -1;
  const dispatch = async (): Promise<unknown> => {
    index += 1;
    const fn = chain[index];
    if (!fn) return undefined;
    return fn({ env, model: model.technicalName, ids, values: options.values, args: options.args ?? [] }, dispatch);
  };
  await dispatch();
}

async function applyComputedFields(env: Environment, model: RuntimeModel, records: Array<Record<string, unknown>>, requestedFields: string[]) {
  const ids = records.map((record) => Number(record.id)).filter((id) => Number.isFinite(id));
  if (!ids.length) return;
  const requested = new Set(requestedFields);
  const computedFields = model.fields.filter((field) => field.stored === false && field.computeMethod && requested.has(field.name));
  for (const field of computedFields) {
    const result = await env.model(model.technicalName).call(field.computeMethod!, ids, [field.name]);
    const values = normalizeComputedResult(result, field.name, ids);
    for (const record of records) {
      const id = Number(record.id);
      record[field.name] = values.get(id) ?? null;
    }
  }
}

async function enrichManyToOneValues(env: Environment, model: RuntimeModel, records: Array<Record<string, unknown>>, requestedFields: string[] | undefined) {
  if (env.context.skipMany2OneEnrichment) return;
  if (!records.length) return;
  const requested = new Set(requestedFields?.length ? requestedFields : model.fields.map((field) => field.name));
  const fields = model.fields.filter((field) => field.type === "many2one" && field.relationModel && requested.has(field.name));
  for (const field of fields) {
    const ids = unique(records.map((record) => Number(record[field.name])).filter((id) => Number.isFinite(id) && id > 0));
    if (!ids.length) continue;
    const relatedModel = env.registry.models.get(field.relationModel!);
    if (!relatedModel) continue;
    const displayField = getDisplayField(relatedModel);
    const relatedRows = await env.model(field.relationModel!).read(ids, [displayField]);
    const labels = new Map(relatedRows.map((row) => [Number(row.id), displayValue(row[displayField]) || String(row.id)]));
    for (const record of records) {
      const id = Number(record[field.name]);
      if (Number.isFinite(id) && labels.has(id)) record[field.name] = [id, labels.get(id)];
    }
  }
}

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value[1] === undefined || value[1] === null ? "" : String(value[1]);
  return value === undefined || value === null ? "" : String(value);
}

function getDisplayField(model: RuntimeModel) {
  return model.fields.find((field) => field.name === "name")?.name
    ?? model.fields.find((field) => field.name === "display_name")?.name
    ?? model.fields.find((field) => field.name === "technical_name")?.name
    ?? model.fields[0]?.name
    ?? "id";
}

function normalizeComputedResult(result: unknown, fieldName: string, ids: number[]) {
  const values = new Map<number, unknown>();
  if (Array.isArray(result)) {
    for (const row of result) {
      if (!row || typeof row !== "object") continue;
      const id = Number((row as Record<string, unknown>).id);
      if (Number.isFinite(id)) values.set(id, (row as Record<string, unknown>)[fieldName]);
    }
    return values;
  }
  if (!result || typeof result !== "object") return values;
  const objectResult = result as Record<string, unknown>;
  const nested = objectResult[fieldName];
  const source = nested && typeof nested === "object" && !Array.isArray(nested) ? nested as Record<string, unknown> : objectResult;
  for (const id of ids) {
    const key = String(id);
    if (key in source) values.set(id, source[key]);
  }
  return values;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function rowToField(row: any): FieldDefinition {
  return {
    name: row.name,
    label: row.label,
    type: row.type,
    required: Boolean(row.required),
    readonly: Boolean(row.readonly),
    indexed: Boolean(row.indexed),
    stored: Boolean(row.stored),
    unique: Boolean(row.unique_flag),
    relationModel: row.relation_model ?? undefined,
    inverseField: row.inverse_field ?? undefined,
    defaultValue: JSON.parse(row.default_value ?? "null"),
    computeMethod: row.compute_method ?? undefined,
    relatedPath: row.related_path ?? undefined,
    selectionOptions: JSON.parse(row.selection_options ?? "null") ?? undefined,
    sequence: row.sequence
  };
}

function buildMenus(): RuntimeMenu[] {
  const rows = db.prepare("SELECT * FROM core_menu WHERE is_active = 1 ORDER BY sequence, id").all() as any[];
  const map = new Map<string, RuntimeMenu>();
  for (const row of rows) {
    map.set(row.technical_name, {
      technicalName: row.technical_name,
      name: row.name,
      parent: row.parent ?? undefined,
      action: row.action ?? undefined,
      icon: row.icon ?? undefined,
      sequence: row.sequence,
      module: row.module,
      children: []
    });
  }
  const roots: RuntimeMenu[] = [];
  for (const menu of map.values()) {
    if (menu.parent && map.has(menu.parent)) map.get(menu.parent)!.children.push(menu);
    else roots.push(menu);
  }
  return roots;
}

function applyViewExtensions(viewName: string, baseArch: ViewNode): ViewNode {
  const extensions = db.prepare("SELECT * FROM core_view_extension WHERE target_view = ? AND is_active = 1 ORDER BY priority, id").all(viewName) as any[];
  let current = structuredClone(baseArch);
  for (const ext of extensions) {
    current = applyExtension(current, ext.operation, ext.target, JSON.parse(ext.content));
  }
  return current;
}

function applyExtension(node: ViewNode, operation: string, target: string, content: ViewNode | ViewNode[]): ViewNode {
  const additions = Array.isArray(content) ? content : [content];
  if ("children" in node) {
    const index = node.children.findIndex((child) => child.type === "field" && child.name === target);
    if (index >= 0) {
      if (operation === "after") node.children.splice(index + 1, 0, ...additions);
      if (operation === "before") node.children.splice(index, 0, ...additions);
      if (operation === "replace") node.children.splice(index, 1, ...additions);
      if (operation === "inside" && "children" in node.children[index]) (node.children[index] as any).children.push(...additions);
      return node;
    }
    node.children = node.children.map((child) => applyExtension(child, operation, target, additions));
  }
  return node;
}

function domainToSql(domain: Domain) {
  if (!domain.length) return { sql: "", params: [] as unknown[] };
  const clauses: string[] = [];
  const params: unknown[] = [];
  for (const [field, op, value] of domain) {
    if (op === "ilike") {
      clauses.push(`${quoteIdent(field)} LIKE ?`);
      params.push(`%${normalizeDomainValue(value)}%`);
    } else if (op === "in") {
      const values = Array.isArray(value) ? value.map(normalizeDomainValue) : [];
      if (!values.length) {
        clauses.push("1 = 0");
        continue;
      }
      clauses.push(`${quoteIdent(field)} IN (${values.map(() => "?").join(", ")})`);
      params.push(...values);
    } else {
      clauses.push(`${quoteIdent(field)} ${op} ?`);
      params.push(normalizeDomainValue(value));
    }
  }
  return { sql: `WHERE ${clauses.join(" AND ")}`, params };
}

function normalizeDomainValue(value: unknown) {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value === undefined) return null;
  if (value && typeof value === "object" && !Buffer.isBuffer(value)) return JSON.stringify(value);
  return value;
}

function normalizeValues(model: RuntimeModel, values: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {};
  for (const field of model.fields) {
    if (field.stored === false) continue;
    if (["create_uid", "create_date", "write_uid", "write_date"].includes(field.name)) continue;
    if (!(field.name in values)) continue;
    const value = values[field.name];
    normalized[field.name] = normalizeFieldValue(field, value);
  }
  if (model.technicalName === "core.user") {
    const password = typeof values.password === "string" ? values.password.trim() : "";
    if (password) normalized.password_hash = hashPassword(password);
  }
  if (model.technicalName === "website.page") {
    const slug = typeof values.slug === "string" ? values.slug : typeof normalized.slug === "string" ? normalized.slug : "";
    if (slug) normalized.url = websiteUrl(slug);
  }
  return normalized;
}

function normalizeFieldValue(field: FieldDefinition, value: unknown) {
  if (field.type === "boolean") return value ? 1 : 0;
  if (field.type === "json") return JSON.stringify(value);
  if (field.type === "many2one") return relationId(value);
  return value;
}

function relationId(value: unknown) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function websiteUrl(slug: string) {
  const normalized = normalizeSlug(slug);
  const path = normalized === "home" ? "" : `/${normalized}`;
  return `${config.websiteBaseUrl.replace(/\/+$/g, "")}${path || "/"}`;
}

function normalizeSlug(slug: string) {
  return slug.trim().replace(/^\/+|\/+$/g, "") || "home";
}

function withCreateAuditDefaults(model: RuntimeModel, values: Record<string, unknown>, userId: number) {
  const now = new Date().toISOString();
  const audited = { ...values };
  if (hasField(model, "create_uid")) audited.create_uid = userId;
  if (hasField(model, "write_uid")) audited.write_uid = userId;
  if (hasField(model, "create_date")) audited.create_date = now;
  if (hasField(model, "write_date")) audited.write_date = now;
  return audited;
}

function withWriteAuditDefaults(model: RuntimeModel, values: Record<string, unknown>, userId: number) {
  const now = new Date().toISOString();
  const audited = { ...values };
  if (hasField(model, "write_uid")) audited.write_uid = userId;
  if (hasField(model, "write_date")) audited.write_date = now;
  return audited;
}

function hasField(model: RuntimeModel, name: string) {
  return model.fields.some((field) => field.name === name);
}

function hasMethod(model: RuntimeModel, name: string) {
  return Boolean(model.methods.get(name)?.length);
}

function withTableDefaults(model: RuntimeModel, values: Record<string, unknown>, creating: boolean) {
  if (model.tableName !== "core_user") return values;
  const now = new Date().toISOString();
  return {
    ...values,
    ...(creating ? { created_at: now } : {}),
    updated_at: now
  };
}

function withMetadataDefaults(tableName: string, values: Record<string, unknown>) {
  if (!tableName.startsWith("core_") || tableName === "core_user") return values;
  const now = new Date().toISOString();
  const defaults: Record<string, unknown> = {
    module: "custom",
    owner_module: "custom",
    is_system: 0,
    is_custom: 1,
    is_active: 1,
    created_at: now,
    updated_at: now
  };
  if (tableName === "core_module") {
    defaults.state = "INSTALLED";
    defaults.installable = 1;
    defaults.auto_install = 0;
    defaults.sequence = 100;
  }
  if (tableName === "core_model") {
    defaults.is_abstract = 0;
    defaults.is_transient = 0;
  }
  if (tableName === "core_model_field") {
    defaults.required = 0;
    defaults.readonly = 0;
    defaults.indexed = 0;
    defaults.stored = 1;
    defaults.unique_flag = 0;
    defaults.sequence = 100;
  }
  if (tableName === "core_view") {
    defaults.priority = 16;
    defaults.content_type = "json";
    if ("architecture" in values && !("content" in values)) defaults.content = values.architecture;
  }
  if (tableName === "core_action") {
    defaults.view_modes = JSON.stringify([]);
    defaults.domain = JSON.stringify([]);
    defaults.context = JSON.stringify({});
    defaults.target = "current";
  }
  if (tableName === "core_menu") {
    defaults.sequence = 100;
  }
  return { ...defaults, ...values };
}

function deserializeRow(model: RuntimeModel, row: Record<string, unknown>) {
  const result = { ...row };
  for (const field of model.fields) {
    if (!(field.name in result)) continue;
    if (field.type === "boolean") result[field.name] = Boolean(result[field.name]);
    if (field.type === "json" && typeof result[field.name] === "string") result[field.name] = JSON.parse(result[field.name] as string);
  }
  return result;
}

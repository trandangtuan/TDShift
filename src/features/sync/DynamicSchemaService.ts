import { fields, JsonField, type Field, type FieldMap, type FieldOptions } from "../../core/fields";
import { Model } from "../../core/Model";
import type { Environment } from "../../core/Environment";
import type { ModelValues, ModelViews } from "../../core/types";
import { OdooClient } from "./OdooClient";

const reservedFields = new Set(["id", "server_id", "sync_status", "created_at", "updated_at"]);

export class OdooJsonField extends JsonField {
  constructor(readonly odooType: string, readonly relationModel: string, options: FieldOptions<unknown> = {}) { super(options); }
}

interface RemoteFieldMeta {
  string?: string;
  type?: string;
  relation?: string;
  relation_field?: string;
  required?: boolean;
  readonly?: boolean;
  selection?: Array<[string, string]>;
}

export class DynamicSchemaService {
  constructor(private readonly env: Environment) {}

  async refresh(client: OdooClient, config: ModelValues, selectedModels: string[], refreshCatalog = true): Promise<void> {
    const now = new Date().toISOString();
    if (refreshCatalog) {
      try { await this.refreshModules(client, config, now); } catch { /* user may not have module administration access */ }
      try { await this.refreshModelCatalog(client, config, now); } catch { /* fields_get still supports explicitly selected models */ }
    }
    await this.ensureSelectedCatalog(config, selectedModels, now);
    await this.registerSelectedModels(config, selectedModels);
    for (const modelName of selectedModels) {
      if (!this.env.registry.hasModel(modelName)) continue;
      const metadata = await client.fieldsGet(modelName) as Record<string, RemoteFieldMeta>;
      await this.storeFields(config, modelName, metadata, now);
      this.applyFields(modelName, metadata);
      await this.env.orm.updateSchema(this.env.registry.getDefinition(modelName));
      try { await this.refreshViews(client, config, modelName, now); } catch { /* keep generic dynamic form when ir.ui.view is restricted */ }
    }
  }

  async restore(): Promise<void> {
    if (!this.env.registry.hasModel("sync.config")) return;
    const configs = await this.env.model("sync.config").searchRead({ where: { active: true }, limit: 20 });
    for (const config of configs) {
      const selected = this.parseModels(config.enabled_models);
      await this.registerSelectedModels(config, selected);
      for (const modelName of selected) {
        if (!this.env.registry.hasModel(modelName)) continue;
        const rows = await this.env.model("sync.remote.field").searchRead({ where: { config_id: config.id as string, model_name: modelName }, limit: 2000 });
        const metadata: Record<string, RemoteFieldMeta> = {};
        for (const row of rows) metadata[String(row.field_name)] = {
          string: String(row.field_label || row.field_name), type: String(row.odoo_type), relation: String(row.relation_model || ""), relation_field: String(row.relation_field || ""),
          required: Boolean(row.required_value), readonly: Boolean(row.readonly_value), selection: this.parseSelection(row.selection_json),
        };
        this.applyFields(modelName, metadata);
        await this.env.orm.updateSchema(this.env.registry.getDefinition(modelName));
        await this.restoreViews(config, modelName);
      }
    }
  }

  async availableModels(configId?: string): Promise<Array<{ name: string; label: string; modules: string }>> {
    if (!this.env.registry.hasModel("sync.remote.model")) return [];
    const rows = await this.env.model("sync.remote.model").searchRead({ where: configId ? { config_id: configId } : {}, limit: 3000 });
    return rows.map((row) => ({ name: String(row.model_name), label: String(row.display_name || row.model_name), modules: String(row.modules || "") }));
  }

  private async refreshModules(client: OdooClient, config: ModelValues, now: string): Promise<void> {
    const model = this.env.model("sync.remote.module");
    const rows = await client.searchRead("ir.module.module", [["state", "=", "installed"]], ["name", "shortdesc", "state", "installed_version"], 3000);
    for (const row of rows) {
      const existing = (await model.searchRead({ where: { config_id: config.id as string, technical_name: String(row.name) }, limit: 1 }))[0];
      const values = { config_id: config.id, technical_name: row.name, display_name: row.shortdesc, server_module_id: row.id, server_state: row.state, server_version: row.installed_version, last_seen_at: now, active: true };
      if (existing) await model.write(existing.id as string, values); else await model.create(values);
    }
  }

  private async refreshModelCatalog(client: OdooClient, config: ModelValues, now: string): Promise<void> {
    const model = this.env.model("sync.remote.model");
    const available = await client.fieldsGet("ir.model");
    const remoteFields = ["model", "name", "modules"].filter((name) => name in available);
    const rows = await client.searchRead("ir.model", [], remoteFields, 5000);
    for (const row of rows) {
      const modelName = String(row.model);
      if (!modelName) continue;
      const existing = (await model.searchRead({ where: { config_id: config.id as string, model_name: modelName }, limit: 1 }))[0];
      const values = { config_id: config.id, model_name: modelName, display_name: row.name, server_model_id: row.id, modules: row.modules ?? "", table_name: this.tableName(modelName), is_dynamic: !this.env.registry.hasModel(modelName), last_seen_at: now, active: true };
      if (existing) await model.write(existing.id as string, values); else await model.create(values);
    }
  }

  private async storeFields(config: ModelValues, modelName: string, metadata: Record<string, RemoteFieldMeta>, now: string): Promise<void> {
    const model = this.env.model("sync.remote.field");
    for (const [fieldName, meta] of Object.entries(metadata)) {
      if (reservedFields.has(fieldName)) continue;
      const existing = (await model.searchRead({ where: { config_id: config.id as string, model_name: modelName, field_name: fieldName }, limit: 1 }))[0];
      const values = { config_id: config.id, model_name: modelName, field_name: fieldName, field_label: meta.string || fieldName, odoo_type: meta.type || "char", relation_model: meta.relation || "", relation_field: meta.relation_field || "", selection_json: JSON.stringify(meta.selection ?? []), required_value: Boolean(meta.required), readonly_value: Boolean(meta.readonly), last_seen_at: now, active: true };
      if (existing) await model.write(existing.id as string, values); else await model.create(values);
    }
  }

  private applyFields(modelName: string, metadata: Record<string, RemoteFieldMeta>): void {
    const definition = this.env.registry.getDefinition(modelName);
    const additions: FieldMap = {};
    for (const [name, meta] of Object.entries(metadata)) {
      if (reservedFields.has(name) || definition.fields[name]) continue;
      additions[name] = this.makeField(name, meta);
    }
    if (Object.keys(additions).length) {
      this.env.registry.extendModel(modelName, additions);
      this.env.registry.extendFormView(modelName, Object.keys(additions));
      const views = this.env.registry.getViews(modelName);
      if (!views.list.fields.length) {
        const allFields = Object.keys(this.env.registry.getDefinition(modelName).fields);
        const preferred = ["display_name", "name", "x_name", ...allFields].filter((name, index, values) => allFields.includes(name) && values.indexOf(name) === index).slice(0, 6);
        this.env.registry.setViews(modelName, { ...views, list: { ...views.list, fields: preferred } });
      }
    }
  }

  private makeField(name: string, meta: RemoteFieldMeta): Field {
    const options = { string: meta.string || name, required: Boolean(meta.required), readonly: Boolean(meta.readonly) };
    switch (meta.type) {
      case "integer": return fields.Integer(options);
      case "float": case "monetary": return fields.Float(options);
      case "boolean": return fields.Boolean(options);
      case "date": return fields.Date(options);
      case "datetime": return fields.Datetime(options);
      case "text": case "html": return fields.Text(options);
      case "binary": return fields.Json({ ...options, readonly: true });
      case "selection": return meta.selection?.length ? fields.Selection(meta.selection, options) : fields.Char(options);
      case "many2one": return meta.relation && this.env.registry.hasModel(meta.relation) ? fields.Many2one(meta.relation, options) : new OdooJsonField("many2one", meta.relation || "", options);
      case "many2many": return meta.relation && this.env.registry.hasModel(meta.relation) ? fields.Many2many(meta.relation, options) : new OdooJsonField("many2many", meta.relation || "", options);
      case "one2many": return meta.relation && meta.relation_field && this.env.registry.hasModel(meta.relation) ? fields.One2many(meta.relation, meta.relation_field, { ...options, readonly: true }) : new OdooJsonField("one2many", meta.relation || "", { ...options, readonly: true });
      case "char": return fields.Char(options);
      default: return new OdooJsonField(meta.type || "json", meta.relation || "", options);
    }
  }

  private async registerSelectedModels(config: ModelValues, selected: string[]): Promise<void> {
    for (const modelName of selected) {
      if (this.env.registry.hasModel(modelName)) continue;
      const row = (await this.env.model("sync.remote.model").searchRead({ where: { config_id: config.id as string, model_name: modelName }, limit: 1 }))[0];
      if (!row) continue;
      const DynamicModel = class extends Model {};
      DynamicModel.modelName = modelName;
      DynamicModel.description = String(row.display_name || modelName);
      DynamicModel.tableName = String(row.table_name || this.tableName(modelName));
      DynamicModel.displayName = "display_name";
      DynamicModel.fields = {};
      this.env.registry.registerModel(DynamicModel, this.fallbackViews(modelName, DynamicModel.description));
      await this.env.orm.createSchema(DynamicModel.definition());
    }
    const dynamicMenus = selected.filter((modelName) => this.env.registry.hasModel(modelName)).map((modelName, index) => ({ id: `odoo.dynamic.${this.safeId(modelName)}`, name: modelName, parentId: "odoo.dynamic.models", sequence: index + 1, modelName }));
    this.env.registry.registerMenus("odoo_dynamic", [{ id: "odoo.dynamic.models", name: "Dữ liệu Odoo", parentId: "sync.menu_root", sequence: 50, icon: "layers-outline" }, ...dynamicMenus]);
  }

  private async ensureSelectedCatalog(config: ModelValues, selected: string[], now: string): Promise<void> {
    const model = this.env.model("sync.remote.model");
    for (const modelName of selected) {
      if (this.env.registry.hasModel(modelName)) continue;
      const existing = (await model.searchRead({ where: { config_id: config.id as string, model_name: modelName }, limit: 1 }))[0];
      if (!existing) await model.create({ config_id: config.id, model_name: modelName, display_name: modelName, server_model_id: 0, modules: "", table_name: this.tableName(modelName), is_dynamic: true, last_seen_at: now, active: true });
    }
  }

  private async refreshViews(client: OdooClient, config: ModelValues, modelName: string, now: string): Promise<void> {
    const available = await client.fieldsGet("ir.ui.view");
    const archField = "arch_db" in available ? "arch_db" : "arch" in available ? "arch" : "";
    if (!archField) return;
    const rows = await client.searchRead("ir.ui.view", [["model", "=", modelName], ["type", "in", ["form", "tree", "list"]]], ["name", "model", "type", "priority", archField], 100);
    const viewModel = this.env.model("sync.remote.view");
    for (const row of rows) {
      const arch = String(row[archField] ?? "");
      const fieldNames = this.fieldsFromArch(arch);
      const existing = (await viewModel.searchRead({ where: { config_id: config.id as string, server_view_id: row.id }, limit: 1 }))[0];
      const values = { config_id: config.id, model_name: modelName, server_view_id: row.id, name: row.name, view_type: row.type, priority: row.priority ?? 16, arch_db: arch, field_names_json: JSON.stringify(fieldNames), last_seen_at: now, active: true };
      if (existing) await viewModel.write(existing.id as string, values); else await viewModel.create(values);
    }
    await this.restoreViews(config, modelName);
  }

  private async restoreViews(config: ModelValues, modelName: string): Promise<void> {
    const rows = await this.env.model("sync.remote.view").searchRead({ where: { config_id: config.id as string, model_name: modelName }, limit: 100 });
    const definition = this.env.registry.getDefinition(modelName);
    const current = this.env.registry.getViews(modelName);
    const merged = (types: string[]) => JSON.stringify(rows.filter((row) => types.includes(String(row.view_type))).sort((a, b) => Number(a.priority ?? 16) - Number(b.priority ?? 16)).flatMap((row) => { try { return JSON.parse(String(row.field_names_json || "[]")) as string[]; } catch { return []; } }).filter((name, index, all) => all.indexOf(name) === index));
    const listFields = this.validViewFields(merged(["list", "tree"]), definition.fields, current.list.fields);
    const formFields = this.validViewFields(merged(["form"]), definition.fields, current.form.fields);
    this.env.registry.setViews(modelName, { list: { type: "list", title: definition.description, fields: listFields.slice(0, 8) }, form: { type: "form", title: definition.description, fields: formFields } });
  }

  private validViewFields(raw: unknown, fieldMap: FieldMap, fallback: string[]): string[] {
    try { const values = JSON.parse(String(raw || "[]")) as string[]; const valid = values.filter((name) => fieldMap[name]); if (valid.length) return valid; } catch { /* use fallback */ }
    const validFallback = fallback.filter((name) => fieldMap[name]);
    return validFallback.length ? validFallback : Object.keys(fieldMap).slice(0, 20);
  }

  private fieldsFromArch(arch: string): string[] {
    const output: string[] = [];
    const pattern = /<field\b[^>]*\bname=["']([^"']+)["'][^>]*>/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(arch))) { const name = match[1]; if (name && !output.includes(name)) output.push(name); }
    return output;
  }

  private fallbackViews(modelName: string, title: string): ModelViews { return { list: { type: "list", title, fields: [] }, form: { type: "form", title, fields: [] } }; }
  private parseModels(value: unknown): string[] { return String(value ?? "").split(/[\n,;]/).map((item) => item.trim()).filter(Boolean); }
  private parseSelection(value: unknown): Array<[string, string]> { try { return JSON.parse(String(value || "[]")); } catch { return []; } }
  private tableName(modelName: string): string { const base = modelName.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 40); let hash = 0; for (const char of modelName) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0; return `odoo_dyn_${base}_${Math.abs(hash).toString(36)}`; }
  private safeId(value: string): string { return value.replace(/[^a-zA-Z0-9_]/g, "_"); }
}

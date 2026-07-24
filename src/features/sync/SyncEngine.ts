import type { Environment } from "../../core/Environment";
import { Many2manyField, Many2oneField, One2manyField } from "../../core/fields";
import type { ModelDefinition, ModelValues } from "../../core/types";
import { OdooClient, type OdooRecord } from "./OdooClient";
import { DynamicSchemaService, OdooJsonField } from "./DynamicSchemaService";

export const DEFAULT_SYNC_MODELS = ["product.category", "product.tag", "product.template", "product.product"];
export const AVAILABLE_SYNC_MODELS = [
  ...DEFAULT_SYNC_MODELS,
  "stock.location", "stock.warehouse", "stock.picking.type", "stock.picking", "stock.move", "stock.quant",
  "pos.payment.method", "pos.config", "pos.session", "pos.order", "pos.order.line", "pos.payment",
];

export interface SyncProgress { model: string; phase: "push" | "pull"; current: number; total: number }
export interface SyncSummary { pushed: number; pulled: number; errors: number }

export class SyncEngine {
  private readonly client: OdooClient;

  constructor(private readonly env: Environment, private readonly config: ModelValues) {
    this.client = new OdooClient(String(config.url), String(config.database), String(config.username), String(config.api_key));
  }

  async testConnection(): Promise<string> {
    const [uid, version] = await Promise.all([this.client.authenticate(), this.client.version()]);
    return `UID ${uid} · Odoo ${String(version.server_version ?? version.server_version_info ?? "không rõ")}`;
  }

  async refreshSchema(): Promise<number> {
    await this.client.authenticate();
    const models = this.enabledModels();
    const service = new DynamicSchemaService(this.env);
    await service.refresh(this.client, this.config, models, true);
    await this.env.model("sync.config").write(this.config.id as string, { schema_refreshed_at: new Date().toISOString() });
    return (await service.availableModels(this.config.id as string)).length;
  }

  async run(onProgress?: (progress: SyncProgress) => void): Promise<SyncSummary> {
    await this.client.authenticate();
    const summary: SyncSummary = { pushed: 0, pulled: 0, errors: 0 };
    const models = this.enabledModels();
    await new DynamicSchemaService(this.env).refresh(this.client, this.config, models, false);
    for (const modelName of models) {
      if (!this.env.registry.hasModel(modelName)) continue;
      try {
        const result = await this.syncModel(modelName, onProgress);
        summary.pushed += result.pushed;
        summary.pulled += result.pulled;
        summary.errors += result.errors;
      } catch (reason) {
        summary.errors += 1;
        await this.log("sync", "error", `${modelName}: đồng bộ thất bại`, modelName, undefined, undefined, this.message(reason));
      }
    }
    const now = new Date().toISOString();
    await this.env.model("sync.config").write(this.config.id as string, { last_sync_at: now, last_error: summary.errors ? `${summary.errors} lỗi, xem nhật ký` : "" });
    await this.log("sync", summary.errors ? "error" : "success", `Hoàn tất: đẩy ${summary.pushed}, tải ${summary.pulled}, lỗi ${summary.errors}`);
    return summary;
  }

  private enabledModels(): string[] {
    const raw = String(this.config.enabled_models ?? "").trim();
    const values = raw ? raw.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean) : DEFAULT_SYNC_MODELS;
    return [...new Set(values)].filter((model) => model && !model.startsWith("sync."));
  }

  private async syncModel(modelName: string, onProgress?: (progress: SyncProgress) => void): Promise<SyncSummary> {
    const result: SyncSummary = { pushed: 0, pulled: 0, errors: 0 };
    const definition = this.env.registry.getDefinition(modelName);
    const serverFields = await this.client.fieldsGet(modelName);
    const pending = await this.env.orm.syncPending(modelName, Number(this.config.batch_size ?? 50));
    for (const [index, record] of pending.entries()) {
      onProgress?.({ model: modelName, phase: "push", current: index + 1, total: pending.length });
      try {
        await this.pushRecord(definition, serverFields, record);
        result.pushed += 1;
      } catch (reason) {
        result.errors += 1;
        await this.log("push", "error", `${modelName}: không đẩy được`, modelName, record.id as string, Number(record.server_id) || undefined, this.message(reason));
      }
    }

    const state = await this.getState(modelName);
    const cursor = String(state.last_server_write_date ?? "");
    const domain: unknown[] = cursor ? [["write_date", ">", this.toOdooDatetime(cursor)]] : [];
    const fields = this.pullFieldNames(definition, serverFields);
    const records = await this.client.searchRead(modelName, domain, [...new Set([...fields, "write_date"])], Number(this.config.batch_size ?? 50));
    let latest = cursor ? this.toOdooDatetime(cursor) : "";
    for (const [index, record] of records.entries()) {
      onProgress?.({ model: modelName, phase: "pull", current: index + 1, total: records.length });
      try {
        const values = await this.fromServer(definition, record);
        await this.env.orm.syncApply(modelName, record.id, values, record.write_date ? this.fromOdooDatetime(record.write_date) : undefined);
        result.pulled += 1;
        if (record.write_date && record.write_date > latest) latest = record.write_date;
      } catch (reason) {
        result.errors += 1;
        await this.log("pull", "error", `${modelName}: không tải được Odoo ID ${record.id}`, modelName, undefined, record.id, this.message(reason));
      }
    }
    await this.env.model("sync.model.state").write(state.id as string, {
      last_server_write_date: latest ? this.fromOdooDatetime(latest) : state.last_server_write_date,
      last_sync_at: new Date().toISOString(), pushed_count: result.pushed, pulled_count: result.pulled, error_count: result.errors,
    });
    return result;
  }

  private async pushRecord(definition: ModelDefinition, serverFields: Record<string, unknown>, record: ModelValues): Promise<void> {
    const localId = record.id as string;
    const serverId = Number(record.server_id) || 0;
    if (record.sync_status === "deleted") {
      if (serverId) await this.client.unlink(definition.name, serverId);
      await this.env.orm.syncMarkPushed(definition.name, localId);
      return;
    }
    const values = await this.toServer(definition, serverFields, record);
    if (serverId) {
      await this.client.write(definition.name, serverId, values);
      await this.env.orm.syncMarkPushed(definition.name, localId);
    } else {
      const createdId = await this.client.create(definition.name, values);
      await this.env.orm.syncMarkPushed(definition.name, localId, createdId);
    }
  }

  private async toServer(definition: ModelDefinition, serverFields: Record<string, unknown>, record: ModelValues): Promise<Record<string, unknown>> {
    const output: Record<string, unknown> = {};
    for (const [name, field] of Object.entries(definition.fields)) {
      if (!(name in serverFields) || field.kind === "one2many" || field.kind === "binary" || field.readonly || record[name] === undefined) continue;
      const metadata = serverFields[name] as { readonly?: boolean } | undefined;
      if (metadata?.readonly) continue;
      if (field instanceof Many2oneField) {
        const relation = record[name] ? await this.env.orm.read(field.comodelName, record[name] as string) : null;
        if (record[name] && !relation?.server_id) throw new Error(`${name}: bản ghi liên quan chưa có Odoo ID`);
        output[name] = relation?.server_id || false;
      } else if (field instanceof Many2manyField) {
        const ids: number[] = [];
        for (const localId of (record[name] as string[]) ?? []) {
          const relation = await this.env.orm.read(field.comodelName, localId);
          if (!relation?.server_id) throw new Error(`${name}: bản ghi liên quan chưa có Odoo ID`);
          ids.push(Number(relation.server_id));
        }
        output[name] = [[6, 0, ids]];
      } else if (field instanceof OdooJsonField && field.odooType === "many2one") {
        const value = record[name];
        output[name] = Array.isArray(value) ? value[0] : value || false;
      } else if (field instanceof OdooJsonField && (field.odooType === "many2many" || field.odooType === "one2many")) {
        output[name] = [[6, 0, Array.isArray(record[name]) ? record[name] : []]];
      } else output[name] = record[name] ?? false;
    }
    return output;
  }

  private async fromServer(definition: ModelDefinition, record: OdooRecord): Promise<ModelValues> {
    const output: ModelValues = {};
    for (const [name, field] of Object.entries(definition.fields)) {
      if (!(name in record) || field instanceof One2manyField || field.kind === "binary") continue;
      const value = record[name];
      if (field instanceof Many2oneField) {
        const serverId = Array.isArray(value) ? Number(value[0]) : Number(value) || 0;
        output[name] = serverId ? (await this.env.orm.syncFindByServerId(field.comodelName, serverId))?.id ?? null : null;
      } else if (field instanceof Many2manyField) {
        const localIds: string[] = [];
        for (const serverId of Array.isArray(value) ? value : []) {
          const relation = await this.env.orm.syncFindByServerId(field.comodelName, Number(serverId));
          if (relation?.id) localIds.push(relation.id as string);
        }
        output[name] = localIds;
      } else output[name] = value === false && field.kind !== "boolean" ? null : value;
    }
    return output;
  }

  private pullFieldNames(definition: ModelDefinition, serverFields: Record<string, unknown>): string[] {
    return Object.entries(definition.fields).filter(([name, field]) => name in serverFields && field.kind !== "one2many" && field.kind !== "binary").map(([name]) => name);
  }

  private async getState(modelName: string): Promise<ModelValues> {
    const model = this.env.model("sync.model.state");
    return (await model.searchRead({ where: { config_id: this.config.id as string, model_name: modelName }, limit: 1 }))[0]
      ?? model.create({ config_id: this.config.id, model_name: modelName, active: true });
  }

  private async log(operation: "connect" | "push" | "pull" | "sync", level: "info" | "success" | "error", name: string, modelName = "", localId?: string, serverId?: number, details = ""): Promise<void> {
    await this.env.model("sync.log").create({ name, config_id: this.config.id, model_name: modelName, local_id: localId ?? "", server_id_value: serverId ?? 0, operation, level, details, logged_at: new Date().toISOString(), active: true });
  }

  private message(reason: unknown): string { return reason instanceof Error ? reason.message : String(reason); }
  private toOdooDatetime(value: string): string { return value.replace("T", " ").replace(/\.\d{3}Z$/, "").slice(0, 19); }
  private fromOdooDatetime(value: string): string { return value.includes("T") ? value : `${value.replace(" ", "T")}Z`; }
}

import { database, initializeCoreDatabase } from "../database/connection";
import { Environment } from "./Environment";
import { Registry } from "./Registry";
import type { ModuleInfo, ModulePlugin } from "./types";

export class ModuleManager {
  constructor(private readonly registry: Registry, private readonly env: Environment) {}

  register(plugin: ModulePlugin): void { this.registry.addPlugin(plugin); }

  async bootstrap(): Promise<void> {
    await initializeCoreDatabase();
    const db = await database();
    const newlyDiscovered = new Set<string>();
    for (const plugin of this.registry.getPlugins()) {
      const existing = await db.getFirstAsync<{ state: string }>("SELECT state FROM ir_module_module WHERE name = ?", plugin.manifest.name);
      if (!existing) {
        newlyDiscovered.add(plugin.manifest.name);
        await db.runAsync(
          `INSERT INTO ir_module_module (name, display_name, installed_version, state, updated_at)
           VALUES (?, ?, NULL, 'uninstalled', ?)`,
          plugin.manifest.name, plugin.manifest.displayName, new Date().toISOString(),
        );
      }
      if (existing?.state === "installed") this.activate(plugin);
    }
    for (const plugin of this.registry.getPlugins().filter((item) => item.manifest.autoInstall && newlyDiscovered.has(item.manifest.name))) {
      const state = await db.getFirstAsync<{ state: string }>("SELECT state FROM ir_module_module WHERE name = ?", plugin.manifest.name);
      if (state?.state !== "installed") await this.install(plugin.manifest.name);
    }
  }

  async list(): Promise<ModuleInfo[]> {
    const db = await database();
    const rows = await db.getAllAsync<{ name: string; state: ModuleInfo["state"]; installed_version: string | null }>("SELECT name, state, installed_version FROM ir_module_module ORDER BY name");
    return this.registry.getPlugins().map((plugin) => {
      const row = rows.find((item) => item.name === plugin.manifest.name);
      return { ...plugin.manifest, state: row?.state ?? "uninstalled", installedVersion: row?.installed_version ?? null };
    });
  }

  async install(name: string): Promise<void> {
    const plugin = this.requirePlugin(name);
    for (const dependency of plugin.manifest.depends ?? []) {
      const db = await database();
      const row = await db.getFirstAsync<{ state: string }>("SELECT state FROM ir_module_module WHERE name = ?", dependency);
      if (row?.state !== "installed") await this.install(dependency);
    }
    this.activate(plugin);
    for (const ModelClass of plugin.models) await this.env.orm.createSchema(ModelClass.definition());
    const db = await database();
    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
      for (const ModelClass of plugin.models) {
        const def = ModelClass.definition();
        await db.runAsync(
          `INSERT OR REPLACE INTO ir_model (model, name, module, table_name, version) VALUES (?, ?, ?, ?, ?)`,
          def.name, def.description, name, def.table, def.version,
        );
      }
      await db.runAsync(
        `UPDATE ir_module_module SET state = 'installed', installed_version = ?, installed_at = COALESCE(installed_at, ?), updated_at = ? WHERE name = ?`,
        plugin.manifest.version, now, now, name,
      );
    });
    await plugin.seed?.(this.env);
  }

  async update(name: string): Promise<void> {
    const plugin = this.requirePlugin(name);
    this.activate(plugin);
    for (const ModelClass of plugin.models) await this.env.orm.updateSchema(ModelClass.definition());
    const db = await database();
    await db.runAsync(
      "UPDATE ir_module_module SET state = 'installed', installed_version = ?, updated_at = ? WHERE name = ?",
      plugin.manifest.version, new Date().toISOString(), name,
    );
  }

  async uninstall(name: string): Promise<void> {
    const plugin = this.requirePlugin(name);
    const db = await database();
    const dependents = this.registry.getPlugins().filter((item) => item.manifest.depends?.includes(name));
    for (const dependent of dependents) {
      const row = await db.getFirstAsync<{ state: string }>("SELECT state FROM ir_module_module WHERE name = ?", dependent.manifest.name);
      if (row?.state === "installed") throw new Error(`Module ${dependent.manifest.displayName} đang phụ thuộc module này`);
    }
    for (const ModelClass of [...plugin.models].reverse()) {
      await this.env.orm.dropSchema(ModelClass.definition());
      this.registry.unregisterModel(ModelClass.modelName);
    }
    await db.runAsync("DELETE FROM ir_model WHERE module = ?", name);
    await db.runAsync(
      "UPDATE ir_module_module SET state = 'uninstalled', installed_version = NULL, installed_at = NULL, updated_at = ? WHERE name = ?",
      new Date().toISOString(), name,
    );
  }

  private activate(plugin: ModulePlugin): void {
    for (const ModelClass of plugin.models) this.registry.registerModel(ModelClass, plugin.views[ModelClass.modelName]);
  }

  private requirePlugin(name: string): ModulePlugin {
    const plugin = this.registry.getPlugin(name);
    if (!plugin) throw new Error(`Không tìm thấy plugin '${name}'`);
    return plugin;
  }
}

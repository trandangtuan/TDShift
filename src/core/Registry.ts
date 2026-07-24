import type { FieldMap } from "./fields";
import { Model } from "./Model";
import type { ModelDefinition, ModelViews, ModulePlugin } from "./types";

export class Registry {
  private readonly modelClasses = new Map<string, typeof Model>();
  private readonly definitions = new Map<string, ModelDefinition>();
  private readonly viewDefinitions = new Map<string, ModelViews>();
  private readonly plugins = new Map<string, ModulePlugin>();

  addPlugin(plugin: ModulePlugin): void {
    this.plugins.set(plugin.manifest.name, plugin);
  }

  getPlugin(name: string): ModulePlugin | undefined { return this.plugins.get(name); }
  getPlugins(): ModulePlugin[] { return [...this.plugins.values()]; }

  registerModel(modelClass: typeof Model, views?: ModelViews): void {
    const definition = modelClass.definition();
    this.modelClasses.set(definition.name, modelClass);
    this.definitions.set(definition.name, definition);
    if (views) this.viewDefinitions.set(definition.name, views);
  }

  unregisterModel(name: string): void {
    this.modelClasses.delete(name);
    this.definitions.delete(name);
    this.viewDefinitions.delete(name);
  }

  extendModel(name: string, extraFields: FieldMap): void {
    const current = this.getDefinition(name);
    this.definitions.set(name, { ...current, fields: { ...current.fields, ...extraFields } });
  }

  getModelClass(name: string): typeof Model {
    const value = this.modelClasses.get(name);
    if (!value) throw new Error(`Model '${name}' chưa được đăng ký`);
    return value;
  }

  getDefinition(name: string): ModelDefinition {
    const value = this.definitions.get(name);
    if (!value) throw new Error(`Không tìm thấy metadata model '${name}'`);
    return value;
  }

  getViews(name: string): ModelViews {
    const value = this.viewDefinitions.get(name);
    if (!value) throw new Error(`Model '${name}' chưa có list/form view`);
    return value;
  }

  hasModel(name: string): boolean { return this.definitions.has(name); }
  listModels(): ModelDefinition[] { return [...this.definitions.values()]; }
}

export const registry = new Registry();

import type { FieldMap } from "./fields";
import { Model } from "./Model";
import type { MenuDefinition, ModelDefinition, ModelViews, ModulePlugin, RegisteredMenu } from "./types";

export class Registry {
  private readonly modelClasses = new Map<string, typeof Model>();
  private readonly definitions = new Map<string, ModelDefinition>();
  private readonly viewDefinitions = new Map<string, ModelViews>();
  private readonly plugins = new Map<string, ModulePlugin>();
  private readonly menus = new Map<string, MenuDefinition & { moduleName: string }>();

  addPlugin(plugin: ModulePlugin): void {
    this.plugins.set(plugin.manifest.name, plugin);
  }

  getPlugin(name: string): ModulePlugin | undefined { return this.plugins.get(name); }
  getPlugins(): ModulePlugin[] { return [...this.plugins.values()]; }

  registerMenus(moduleName: string, definitions: MenuDefinition[]): void {
    this.unregisterMenus(moduleName);
    const incomingIds = new Set(definitions.map((menu) => menu.id));
    if (incomingIds.size !== definitions.length) throw new Error(`Module '${moduleName}' có menu id bị trùng`);

    for (const menu of definitions) {
      if (this.menus.has(menu.id)) throw new Error(`Menu '${menu.id}' đã được module khác đăng ký`);
      if (menu.modelName && menu.screen) throw new Error(`Menu '${menu.name}' không thể vừa mở model vừa mở screen`);
      if (menu.modelName && !this.hasModel(menu.modelName)) throw new Error(`Menu '${menu.name}' tham chiếu model chưa được đăng ký`);
      if (menu.parentId && !incomingIds.has(menu.parentId) && !this.menus.has(menu.parentId)) {
        throw new Error(`Không tìm thấy menu cha '${menu.parentId}'`);
      }
      this.menus.set(menu.id, { ...menu, moduleName });
    }
    this.assertMenuDepth();
  }

  unregisterMenus(moduleName: string): void {
    for (const [id, menu] of this.menus) if (menu.moduleName === moduleName) this.menus.delete(id);
  }

  getMenuTree(): RegisteredMenu[] {
    const build = (parentId: string | undefined, level: number): RegisteredMenu[] =>
      [...this.menus.values()]
        .filter((menu) => menu.parentId === parentId)
        .sort((a, b) => (a.sequence ?? 10) - (b.sequence ?? 10) || a.name.localeCompare(b.name))
        .map((menu) => ({ ...menu, level, children: build(menu.id, level + 1) }));
    return build(undefined, 1);
  }

  private assertMenuDepth(): void {
    for (const menu of this.menus.values()) {
      let current: (MenuDefinition & { moduleName: string }) | undefined = menu;
      let depth = 0;
      const visited = new Set<string>();
      while (current) {
        if (visited.has(current.id)) throw new Error(`Menu '${menu.name}' tạo quan hệ cha vòng lặp`);
        visited.add(current.id);
        depth += 1;
        if (depth > 4) throw new Error(`Menu '${menu.name}' vượt quá giới hạn 4 cấp`);
        current = current.parentId ? this.menus.get(current.parentId) : undefined;
      }
    }
  }

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

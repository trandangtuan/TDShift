import type { FieldMap } from "./fields";

export type RecordId = string;
export type ModelValues = Record<string, unknown>;

export interface ModelDefinition {
  name: string;
  description: string;
  table: string;
  version: number;
  fields: FieldMap;
  displayName: string;
}

export interface ListViewDefinition {
  type: "list";
  title: string;
  fields: string[];
}

export interface FormViewDefinition {
  type: "form";
  title: string;
  fields: string[];
}

export interface ModelViews {
  list: ListViewDefinition;
  form: FormViewDefinition;
}

export interface MenuDefinition {
  id: string;
  name: string;
  parentId?: string;
  sequence?: number;
  modelName?: string;
  icon?: string;
}

export interface RegisteredMenu extends MenuDefinition {
  moduleName: string;
  level: number;
  children: RegisteredMenu[];
}

export interface ModuleManifest {
  name: string;
  displayName: string;
  version: string;
  summary: string;
  depends?: string[];
  autoInstall?: boolean;
}

export interface ModulePlugin {
  manifest: ModuleManifest;
  models: Array<typeof import("./Model").Model>;
  views: Record<string, ModelViews>;
  menus?: MenuDefinition[];
  seed?: (env: import("./Environment").Environment) => Promise<void>;
}

export type ModuleState = "uninstalled" | "installed" | "to_upgrade";

export interface ModuleInfo extends ModuleManifest {
  state: ModuleState;
  installedVersion: string | null;
}

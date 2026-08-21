export type ModuleState =
  | "UNINSTALLED"
  | "TO_INSTALL"
  | "INSTALLED"
  | "TO_UPGRADE"
  | "TO_REMOVE"
  | "DISABLED";

export type FieldType =
  | "char"
  | "text"
  | "integer"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "selection"
  | "many2one"
  | "one2many"
  | "json";

export type ViewType = "list" | "form" | "search" | "page";
export type ViewContentType = "json" | "html" | "xml";
export type ActionType = "window" | "client";
export type DomainTerm = [string, "=" | "!=" | ">" | ">=" | "<" | "<=" | "ilike", unknown];
export type Domain = DomainTerm[];

export interface ModuleDefinition {
  technicalName: string;
  displayName: string;
  version: string;
  description?: string;
  depends?: string[];
  installable?: boolean;
  autoInstall?: boolean;
  sequence?: number;
  models?: ModelDefinition[];
  views?: ViewDefinition[];
  viewExtensions?: ViewExtensionDefinition[];
  actions?: ActionDefinition[];
  menus?: MenuDefinition[];
  data?: DataRecordDefinition[];
}

export interface ModelDefinition {
  technicalName: string;
  name: string;
  tableName: string;
  isAbstract?: boolean;
  isTransient?: boolean;
  fields: FieldDefinition[];
  methods?: Record<string, ModelMethod>;
  extensions?: ModelExtensionDefinition[];
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readonly?: boolean;
  indexed?: boolean;
  stored?: boolean;
  unique?: boolean;
  relationModel?: string;
  inverseField?: string;
  defaultValue?: unknown;
  computeMethod?: string;
  relatedPath?: string;
  selectionOptions?: Array<{ label: string; value: string }>;
  sequence?: number;
}

export interface ViewDefinition {
  technicalName: string;
  name: string;
  model: string;
  type: ViewType;
  contentType?: ViewContentType;
  content?: string;
  priority?: number;
  architecture: ViewNode;
}

export interface ViewExtensionDefinition {
  technicalName: string;
  targetView: string;
  operation: "after" | "before" | "inside" | "replace";
  target: string;
  content: ViewNode | ViewNode[];
  priority?: number;
}

export type ViewNode =
  | { type: "form"; model?: string; children: ViewNode[] }
  | { type: "list"; model?: string; fields: string[] }
  | { type: "group"; label?: string; children: ViewNode[] }
  | { type: "field"; name: string }
  | { type: "notebook"; children: ViewNode[] }
  | { type: "page"; label: string; children: ViewNode[] };

export interface ActionDefinition {
  technicalName: string;
  name: string;
  type: ActionType;
  model?: string;
  viewModes?: ViewType[];
  domain?: Domain;
  context?: Record<string, unknown>;
  target?: "current" | "new";
}

export interface MenuDefinition {
  technicalName: string;
  name: string;
  parent?: string;
  action?: string;
  icon?: string;
  sequence?: number;
}

export interface DataRecordDefinition {
  externalId: string;
  model: string;
  values: Record<string, unknown>;
}

export interface ModelExtensionDefinition {
  model: string;
  method: string;
  sequence?: number;
  handler: ModelMethod;
}

export type ModelMethod = (ctx: MethodContext, next?: () => Promise<unknown>) => Promise<unknown>;

export interface MethodContext {
  env: Environment;
  model: string;
  ids: number[];
  values?: Record<string, unknown>;
  args?: unknown[];
}

export interface Environment {
  user: { id: number; login?: string; name: string };
  context: Record<string, unknown>;
  registry: RuntimeRegistry;
  model(name: string): ModelRuntime;
  withContext(context: Record<string, unknown>): Environment;
}

export interface RuntimeRegistry {
  models: Map<string, RuntimeModel>;
  actions: Map<string, RuntimeAction>;
  views: Map<string, RuntimeView>;
  menus: RuntimeMenu[];
}

export interface RuntimeModel extends Omit<ModelDefinition, "methods" | "extensions"> {
  module: string;
  methods: Map<string, ModelMethod[]>;
}

export interface RuntimeAction extends ActionDefinition {
  module: string;
}

export interface RuntimeView extends ViewDefinition {
  module: string;
}

export interface RuntimeMenu extends MenuDefinition {
  module: string;
  children: RuntimeMenu[];
}

export interface ModelRuntime {
  search(domain?: Domain, options?: { limit?: number; offset?: number }): Promise<number[]>;
  read(ids: number[], fields?: string[]): Promise<Array<Record<string, unknown>>>;
  searchRead(domain?: Domain, fields?: string[], options?: { limit?: number; offset?: number }): Promise<Array<Record<string, unknown>>>;
  create(values: Record<string, unknown>): Promise<number>;
  write(ids: number[], values: Record<string, unknown>): Promise<void>;
  unlink(ids: number[]): Promise<void>;
  call(method: string, ids: number[], args?: unknown[]): Promise<unknown>;
}

export function defineModule(definition: ModuleDefinition): ModuleDefinition {
  return definition;
}

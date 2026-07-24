import type { Environment } from "./Environment";
import type { FieldMap } from "./fields";
import type { ModelDefinition, ModelValues, RecordId, SearchQuery } from "./types";

export class Model {
  static modelName = "base";
  static description = "Base Model";
  static tableName = "base";
  static modelVersion = 1;
  static displayName = "name";
  static fields: FieldMap = {};

  constructor(protected readonly env: Environment) {}

  static definition(): ModelDefinition {
    return {
      name: this.modelName,
      description: this.description,
      table: this.tableName,
      version: this.modelVersion,
      displayName: this.displayName,
      fields: this.collectFields(),
    };
  }

  static collectFields(): FieldMap {
    const parent = Object.getPrototypeOf(this) as typeof Model | undefined;
    const inherited = parent?.collectFields && parent !== Model ? parent.collectFields() : {};
    return { ...inherited, ...this.fields };
  }

  searchRead(query?: SearchQuery): Promise<ModelValues[]> {
    return this.env.orm.searchRead((this.constructor as typeof Model).modelName, query);
  }

  read(id: RecordId): Promise<ModelValues | null> {
    return this.env.orm.read((this.constructor as typeof Model).modelName, id);
  }

  create(values: ModelValues): Promise<ModelValues> {
    return this.env.orm.create((this.constructor as typeof Model).modelName, values);
  }

  write(id: RecordId, values: ModelValues): Promise<ModelValues> {
    return this.env.orm.write((this.constructor as typeof Model).modelName, id, values);
  }

  unlink(id: RecordId): Promise<void> {
    return this.env.orm.unlink((this.constructor as typeof Model).modelName, id);
  }
}

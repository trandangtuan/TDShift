import { Model } from "./Model";
import { ORM } from "./ORM";
import { Registry } from "./Registry";

export class Environment {
  readonly orm: ORM;

  constructor(readonly registry: Registry) {
    this.orm = new ORM(registry);
  }

  model<T extends Model = Model>(name: string): T {
    const ModelClass = this.registry.getModelClass(name);
    return new ModelClass(this) as T;
  }
}

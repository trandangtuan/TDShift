import { Environment } from "../core/Environment";
import { ModuleManager } from "../core/ModuleManager";
import { registry } from "../core/Registry";
import { productModule } from "../modules/product";
import { baseModule } from "../modules/base";
import { stockModule } from "../modules/stock";
import { posModule } from "../modules/pos";

export const env = new Environment(registry);
export const moduleManager = new ModuleManager(registry, env);

moduleManager.register(baseModule);
moduleManager.register(productModule);
moduleManager.register(stockModule);
moduleManager.register(posModule);

export async function bootstrap(): Promise<void> {
  await moduleManager.bootstrap();
}

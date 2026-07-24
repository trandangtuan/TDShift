import { Environment } from "../core/Environment";
import { ModuleManager } from "../core/ModuleManager";
import { registry } from "../core/Registry";
import { productModule } from "../modules/product";

export const env = new Environment(registry);
export const moduleManager = new ModuleManager(registry, env);

moduleManager.register(productModule);

export async function bootstrap(): Promise<void> {
  await moduleManager.bootstrap();
}

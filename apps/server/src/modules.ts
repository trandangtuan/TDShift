import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { ModuleDefinition } from "@record-platform/core";

const modulesDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../../modules");

export const moduleDefinitions = await loadModuleDefinitions();

async function loadModuleDefinitions(): Promise<ModuleDefinition[]> {
	const entries = await readdir(modulesDirectory, { withFileTypes: true });
	const definitions: ModuleDefinition[] = [];

	for (const entry of entries.filter((item) => item.isDirectory()).sort((left, right) => left.name.localeCompare(right.name))) {
		const modulePath = join(modulesDirectory, entry.name, "module");
		const sourcePath = `${modulePath}.ts`;
		const builtPath = `${modulePath}.js`;
		if (!existsSync(sourcePath) && !existsSync(builtPath)) continue;

		const imported = await import(pathToFileURL(existsSync(builtPath) ? builtPath : sourcePath).href) as { default?: ModuleDefinition };
		if (!imported.default) throw new Error(`Module ${entry.name} must export a default definition.`);
		definitions.push(imported.default);
	}

	return sortModulesByDependencies(definitions);
}

function sortModulesByDependencies(definitions: ModuleDefinition[]) {
	const pending = new Map(definitions.map((definition) => [definition.technicalName, definition]));
	const sorted: ModuleDefinition[] = [];

	while (pending.size) {
		const ready = [...pending.values()].filter((definition) => (definition.depends ?? []).every((dependency) => !pending.has(dependency)));
		if (!ready.length) {
			throw new Error(`Circular or missing module dependency: ${[...pending.keys()].join(", ")}`);
		}
		ready.sort((left, right) => (left.sequence ?? 100) - (right.sequence ?? 100) || left.technicalName.localeCompare(right.technicalName));
		for (const definition of ready) {
			pending.delete(definition.technicalName);
			sorted.push(definition);
		}
	}

	return sorted;
}

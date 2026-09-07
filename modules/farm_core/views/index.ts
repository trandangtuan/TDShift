import type { ViewDefinition } from "@record-platform/core";
import { farmCoreModels } from "../models";

function listView(model: (typeof farmCoreModels)[number], fields: string[]): ViewDefinition {
  return { technicalName: `farm_core.${model.technicalName}.list`, name: model.name, model: model.technicalName, type: "list", architecture: { type: "list", model: model.technicalName, fields } };
}

function formView(model: (typeof farmCoreModels)[number], fields: string[]): ViewDefinition {
  return { technicalName: `farm_core.${model.technicalName}.form`, name: model.name, model: model.technicalName, type: "form", architecture: { type: "form", model: model.technicalName, children: [{ type: "group", children: fields.map((name) => ({ type: "field" as const, name })) }] } };
}

const viewField: Record<string, string[]> = {
  "farm.farm": ["name", "code", "production_type", "state", "manager_id"],
  "farm.area": ["name", "code", "farm_id", "area_type", "area", "manager_id"],
  "farm.production.unit": ["name", "code", "area_id", "unit_type", "capacity", "state"],
  "farm.species": ["name", "code", "production_type", "tracks_individual", "tracks_breeding", "active"],
  "farm.breed": ["name", "code", "species_id", "supplier_id", "active"],
  "farm.batch": ["name", "code", "species_id", "breed_id", "farm_id", "production_unit_id", "start_date", "initial_quantity", "state"],
  "farm.movement": ["name", "batch_id", "source_unit_id", "destination_unit_id", "quantity", "movement_date"],
  "farm.growth": ["name", "batch_id", "measurement_date", "sample_quantity", "total_weight", "average_weight", "adg"],
  "farm.mortality": ["name", "batch_id", "production_unit_id", "mortality_date", "quantity", "cause"]
};

export const farmCoreViews = farmCoreModels.flatMap((model) => {
  const fields = viewField[model.technicalName] ?? ["name"];
  return [listView(model, fields), formView(model, fields)];
});

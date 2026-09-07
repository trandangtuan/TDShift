import type { DataRecordDefinition } from "@record-platform/core";

export const farmCoreData: DataRecordDefinition[] = [
  { externalId: "farm_core.species_pig", model: "farm.species", values: { name: "Pig", code: "pig", production_type: "animal", tracks_individual: false, tracks_breeding: true, quantity_uom: "Head", weight_uom: "kg", active: true } },
  { externalId: "farm_core.species_chicken", model: "farm.species", values: { name: "Chicken", code: "chicken", production_type: "animal", tracks_individual: false, tracks_breeding: false, quantity_uom: "Head", weight_uom: "kg", active: true } },
  { externalId: "farm_core.species_duck", model: "farm.species", values: { name: "Duck", code: "duck", production_type: "animal", tracks_individual: false, tracks_breeding: false, quantity_uom: "Head", weight_uom: "kg", active: true } },
  { externalId: "farm_core.species_cattle", model: "farm.species", values: { name: "Cattle", code: "cattle", production_type: "animal", tracks_individual: true, tracks_breeding: true, quantity_uom: "Head", weight_uom: "kg", active: true } },
  { externalId: "farm_core.species_fish", model: "farm.species", values: { name: "Fish", code: "fish", production_type: "aquaculture", tracks_individual: false, tracks_breeding: false, quantity_uom: "Head", weight_uom: "kg", active: true } },
  { externalId: "farm_core.species_shrimp", model: "farm.species", values: { name: "Shrimp", code: "shrimp", production_type: "aquaculture", tracks_individual: false, tracks_breeding: false, quantity_uom: "Head", weight_uom: "kg", active: true } }
];

import { defineModule } from "@record-platform/core";
import { farmCoreData } from "./data";
import { farmCoreModels } from "./models";
import { farmCoreViews } from "./views";

const modelActions = farmCoreModels.map((model) => ({
  technicalName: `farm_core.action_${model.technicalName.replaceAll(".", "_")}`,
  name: model.name,
  type: "window" as const,
  model: model.technicalName,
  viewModes: ["list", "form"] as ("list" | "form")[]
}));

export default defineModule({
  technicalName: "farm_core",
  displayName: "Farm Core",
  version: "1.0.0",
  description: "Shared farm, production unit, species, breed, batch, growth, movement, and mortality operations.",
  depends: ["base", "contacts"],
  sequence: 25,
  models: farmCoreModels,
  views: farmCoreViews,
  actions: modelActions,
  menus: [
    { technicalName: "farm_core.menu_root", name: "Farm", icon: "tractor", sequence: 25 },
    { technicalName: "farm_core.menu_configuration", name: "Config", parent: "farm_core.menu_root", sequence: 10 },
    { technicalName: "farm_core.menu_farms", name: "Farms", parent: "farm_core.menu_configuration", action: "farm_core.action_farm_farm", sequence: 10 },
    { technicalName: "farm_core.menu_areas", name: "Areas", parent: "farm_core.menu_configuration", action: "farm_core.action_farm_area", sequence: 20 },
    { technicalName: "farm_core.menu_production_units", name: "Production Units", parent: "farm_core.menu_configuration", action: "farm_core.action_farm_production_unit", sequence: 30 },
    { technicalName: "farm_core.menu_species", name: "Species", parent: "farm_core.menu_configuration", action: "farm_core.action_farm_species", sequence: 40 },
    { technicalName: "farm_core.menu_breeds", name: "Breeds", parent: "farm_core.menu_configuration", action: "farm_core.action_farm_breed", sequence: 50 },
    { technicalName: "farm_core.menu_operations", name: "Operations", parent: "farm_core.menu_root", sequence: 20 },
    { technicalName: "farm_core.menu_batches", name: "Production Batches", parent: "farm_core.menu_operations", action: "farm_core.action_farm_batch", sequence: 10 },
    { technicalName: "farm_core.menu_movements", name: "Batch Movements", parent: "farm_core.menu_operations", action: "farm_core.action_farm_movement", sequence: 20 },
    { technicalName: "farm_core.menu_growth", name: "Growth Measurements", parent: "farm_core.menu_operations", action: "farm_core.action_farm_growth", sequence: 30 },
    { technicalName: "farm_core.menu_mortality", name: "Mortality", parent: "farm_core.menu_operations", action: "farm_core.action_farm_mortality", sequence: 40 }
  ],
  data: farmCoreData
});

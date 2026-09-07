import type { ModelDefinition } from "@record-platform/core";

export const farmModel: ModelDefinition = {
  technicalName: "farm.farm",
  name: "Farm",
  tableName: "farm_farm",
  fields: [
    { name: "name", label: "Farm Name", type: "char", required: true, sequence: 10 },
    { name: "code", label: "Farm Code", type: "char", required: true, indexed: true, sequence: 20 },
    { name: "address", label: "Địa chỉ", type: "text", sequence: 30 },
    { name: "manager_id", label: "Manager", type: "many2one", relationModel: "core.user", sequence: 40 },
    { name: "area", label: "Area", type: "decimal", defaultValue: 0, sequence: 50 },
    { name: "production_type", label: "Production Type", type: "selection", selectionOptions: [{ label: "Animal Farming", value: "animal" }, { label: "Aquaculture", value: "aquaculture" }], sequence: 60 },
    { name: "state", label: "Status", type: "selection", defaultValue: "active", selectionOptions: [{ label: "Hoạt động", value: "active" }, { label: "Paused", value: "paused" }, { label: "Closed", value: "closed" }], sequence: 70 }
  ]
};

export const areaModel: ModelDefinition = {
  technicalName: "farm.area",
  name: "Farm Area",
  tableName: "farm_area",
  fields: [
    { name: "name", label: "Area Name", type: "char", required: true, sequence: 10 },
    { name: "code", label: "Area Code", type: "char", required: true, indexed: true, sequence: 20 },
    { name: "farm_id", label: "Farm", type: "many2one", relationModel: "farm.farm", required: true, indexed: true, sequence: 30 },
    { name: "area", label: "Area", type: "decimal", defaultValue: 0, sequence: 40 },
    { name: "area_type", label: "Area Type", type: "selection", selectionOptions: [{ label: "Animal", value: "animal" }, { label: "Aquaculture", value: "aquaculture" }, { label: "Mixed", value: "mixed" }], sequence: 50 },
    { name: "manager_id", label: "Responsible", type: "many2one", relationModel: "core.user", sequence: 60 }
  ]
};

export const productionUnitModel: ModelDefinition = {
  technicalName: "farm.production.unit",
  name: "Production Unit",
  tableName: "farm_production_unit",
  fields: [
    { name: "name", label: "Unit Name", type: "char", required: true, sequence: 10 },
    { name: "code", label: "Unit Code", type: "char", required: true, indexed: true, sequence: 20 },
    { name: "area_id", label: "Area", type: "many2one", relationModel: "farm.area", required: true, indexed: true, sequence: 30 },
    { name: "unit_type", label: "Unit Type", type: "selection", selectionOptions: [{ label: "Barn", value: "barn" }, { label: "House", value: "house" }, { label: "Pond", value: "pond" }, { label: "Tank", value: "tank" }, { label: "Cage", value: "cage" }, { label: "Other", value: "other" }], sequence: 40 },
    { name: "capacity", label: "Capacity", type: "decimal", defaultValue: 0, sequence: 50 },
    { name: "area", label: "Area", type: "decimal", defaultValue: 0, sequence: 60 },
    { name: "responsible_id", label: "Responsible", type: "many2one", relationModel: "core.user", sequence: 70 },
    { name: "state", label: "Status", type: "selection", defaultValue: "active", selectionOptions: [{ label: "Hoạt động", value: "active" }, { label: "Inactive", value: "inactive" }], sequence: 80 }
  ]
};

export const speciesModel: ModelDefinition = {
  technicalName: "farm.species",
  name: "Species",
  tableName: "farm_species",
  fields: [
    { name: "name", label: "Species", type: "char", required: true, sequence: 10 },
    { name: "code", label: "Species Code", type: "char", required: true, indexed: true, sequence: 20 },
    { name: "production_type", label: "Production Type", type: "selection", selectionOptions: [{ label: "Animal Farming", value: "animal" }, { label: "Aquaculture", value: "aquaculture" }], sequence: 30 },
    { name: "tracks_individual", label: "Track Individual Animals", type: "boolean", defaultValue: false, sequence: 40 },
    { name: "tracks_breeding", label: "Track Breeding", type: "boolean", defaultValue: false, sequence: 50 },
    { name: "quantity_uom", label: "Quantity Unit", type: "char", defaultValue: "Unit", sequence: 60 },
    { name: "weight_uom", label: "Weight Unit", type: "char", defaultValue: "kg", sequence: 70 },
    { name: "active", label: "Hoạt động", type: "boolean", defaultValue: true, sequence: 80 }
  ]
};

export const breedModel: ModelDefinition = {
  technicalName: "farm.breed",
  name: "Breed",
  tableName: "farm_breed",
  fields: [
    { name: "name", label: "Breed", type: "char", required: true, sequence: 10 },
    { name: "code", label: "Breed Code", type: "char", required: true, indexed: true, sequence: 20 },
    { name: "species_id", label: "Species", type: "many2one", relationModel: "farm.species", required: true, indexed: true, sequence: 30 },
    { name: "supplier_id", label: "Nhà cung cấp", type: "many2one", relationModel: "res.partner", sequence: 40 },
    { name: "description", label: "Characteristics", type: "text", sequence: 50 },
    { name: "active", label: "Hoạt động", type: "boolean", defaultValue: true, sequence: 60 }
  ]
};

export const batchModel: ModelDefinition = {
  technicalName: "farm.batch",
  name: "Production Batch",
  tableName: "farm_batch",
  fields: [
    { name: "name", label: "Batch Name", type: "char", required: true, sequence: 10 },
    { name: "code", label: "Batch Code", type: "char", required: true, indexed: true, sequence: 20 },
    { name: "species_id", label: "Species", type: "many2one", relationModel: "farm.species", required: true, indexed: true, sequence: 30 },
    { name: "breed_id", label: "Breed", type: "many2one", relationModel: "farm.breed", sequence: 40 },
    { name: "farm_id", label: "Farm", type: "many2one", relationModel: "farm.farm", required: true, indexed: true, sequence: 50 },
    { name: "area_id", label: "Area", type: "many2one", relationModel: "farm.area", sequence: 60 },
    { name: "production_unit_id", label: "Production Unit", type: "many2one", relationModel: "farm.production.unit", sequence: 70 },
    { name: "start_date", label: "Start Date", type: "date", required: true, sequence: 80 },
    { name: "initial_quantity", label: "Initial Quantity", type: "decimal", defaultValue: 0, sequence: 90 },
    { name: "initial_weight", label: "Initial Weight", type: "decimal", defaultValue: 0, sequence: 100 },
    { name: "supplier_id", label: "Nhà cung cấp", type: "many2one", relationModel: "res.partner", sequence: 110 },
    { name: "purchase_cost", label: "Purchase Cost", type: "decimal", defaultValue: 0, sequence: 120 },
    { name: "responsible_id", label: "Responsible", type: "many2one", relationModel: "core.user", sequence: 130 },
    { name: "state", label: "Status", type: "selection", defaultValue: "draft", selectionOptions: [{ label: "Nháp", value: "draft" }, { label: "Planned", value: "planned" }, { label: "Hoạt động", value: "active" }, { label: "Completed", value: "completed" }, { label: "Đã hủy", value: "cancelled" }], sequence: 140 }
  ]
};

export const movementModel: ModelDefinition = {
  technicalName: "farm.movement",
  name: "Batch Movement",
  tableName: "farm_movement",
  fields: [
    { name: "name", label: "Movement Reference", type: "char", required: true, sequence: 10 },
    { name: "batch_id", label: "Batch", type: "many2one", relationModel: "farm.batch", required: true, indexed: true, sequence: 20 },
    { name: "source_unit_id", label: "From Unit", type: "many2one", relationModel: "farm.production.unit", sequence: 30 },
    { name: "destination_unit_id", label: "To Unit", type: "many2one", relationModel: "farm.production.unit", required: true, sequence: 40 },
    { name: "quantity", label: "Số lượng", type: "decimal", required: true, sequence: 50 },
    { name: "movement_date", label: "Movement Date", type: "date", required: true, sequence: 60 },
    { name: "reason", label: "Reason", type: "text", sequence: 70 },
    { name: "responsible_id", label: "Performed By", type: "many2one", relationModel: "core.user", sequence: 80 }
  ]
};

export const growthModel: ModelDefinition = {
  technicalName: "farm.growth",
  name: "Growth Measurement",
  tableName: "farm_growth",
  fields: [
    { name: "name", label: "Measurement", type: "char", required: true, sequence: 10 },
    { name: "batch_id", label: "Batch", type: "many2one", relationModel: "farm.batch", required: true, indexed: true, sequence: 20 },
    { name: "measurement_date", label: "Ngày", type: "date", required: true, sequence: 30 },
    { name: "sample_quantity", label: "Sample Quantity", type: "decimal", defaultValue: 0, sequence: 40 },
    { name: "total_weight", label: "Total Weight", type: "decimal", defaultValue: 0, sequence: 50 },
    { name: "average_weight", label: "Average Weight", type: "decimal", defaultValue: 0, sequence: 60 },
    { name: "adg", label: "ADG", type: "decimal", defaultValue: 0, sequence: 70 },
    { name: "responsible_id", label: "Performed By", type: "many2one", relationModel: "core.user", sequence: 80 },
    { name: "notes", label: "Ghi chú", type: "text", sequence: 90 }
  ]
};

export const mortalityModel: ModelDefinition = {
  technicalName: "farm.mortality",
  name: "Mortality Record",
  tableName: "farm_mortality",
  fields: [
    { name: "name", label: "Mortality Reference", type: "char", required: true, sequence: 10 },
    { name: "batch_id", label: "Batch", type: "many2one", relationModel: "farm.batch", required: true, indexed: true, sequence: 20 },
    { name: "production_unit_id", label: "Production Unit", type: "many2one", relationModel: "farm.production.unit", sequence: 30 },
    { name: "mortality_date", label: "Ngày", type: "date", required: true, sequence: 40 },
    { name: "quantity", label: "Số lượng", type: "decimal", required: true, sequence: 50 },
    { name: "weight", label: "Weight", type: "decimal", defaultValue: 0, sequence: 60 },
    { name: "cause", label: "Cause", type: "selection", selectionOptions: [{ label: "Disease", value: "disease" }, { label: "Accident", value: "accident" }, { label: "Environment", value: "environment" }, { label: "Unknown", value: "unknown" }, { label: "Other", value: "other" }], sequence: 70 },
    { name: "notes", label: "Ghi chú", type: "text", sequence: 80 }
  ]
};

export const farmCoreModels = [farmModel, areaModel, productionUnitModel, speciesModel, breedModel, batchModel, movementModel, growthModel, mortalityModel];

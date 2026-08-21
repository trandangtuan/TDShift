import type { ModelDefinition } from "@record-platform/core";

export const externalIdModel: ModelDefinition = {
  technicalName: "core.external.id",
  name: "External ID",
  tableName: "core_external_id",
  fields: [
    { name: "complete_name", label: "Complete Name", type: "char", required: true, sequence: 10 },
    { name: "resource_type", label: "Resource Type", type: "char", required: true, sequence: 20 },
    { name: "resource_id", label: "Resource ID", type: "integer", required: true, sequence: 30 }
  ]
};

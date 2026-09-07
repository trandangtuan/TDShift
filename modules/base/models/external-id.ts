import type { ModelDefinition } from "@record-platform/core";

export const externalIdModel: ModelDefinition = {
  technicalName: "core.external.id",
  name: "ID ngoài",
  tableName: "core_external_id",
  fields: [
    { name: "complete_name", label: "Tên đầy đủ", type: "char", required: true, sequence: 10 },
    { name: "resource_type", label: "Type tài nguyên", type: "char", required: true, sequence: 20 },
    { name: "resource_id", label: "ID tài nguyên", type: "integer", required: true, sequence: 30 }
  ]
};

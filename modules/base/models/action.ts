import type { ModelDefinition } from "@record-platform/core";

export const actionModel: ModelDefinition = {
  technicalName: "core.action",
  name: "Action",
  tableName: "core_action",
  fields: [
    { name: "technical_name", label: "Technical Name", type: "char", required: true, sequence: 10 },
    { name: "name", label: "Name", type: "char", required: true, sequence: 20 },
    { name: "type", label: "Type", type: "char", required: true, sequence: 30 },
    { name: "model", label: "Model", type: "char", sequence: 40 },
    { name: "view_modes", label: "View Modes", type: "json", sequence: 50 }
  ]
};

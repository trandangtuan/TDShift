import type { ModelDefinition } from "@record-platform/core";

export const viewModel: ModelDefinition = {
  technicalName: "core.view",
  name: "View",
  tableName: "core_view",
  fields: [
    { name: "technical_name", label: "Technical Name", type: "char", required: true, sequence: 10 },
    { name: "name", label: "Name", type: "char", required: true, sequence: 20 },
    { name: "model", label: "Model", type: "char", required: true, sequence: 30 },
    { name: "type", label: "Type", type: "char", required: true, sequence: 40 },
    { name: "architecture", label: "Architecture", type: "json", required: true, sequence: 50 }
  ]
};

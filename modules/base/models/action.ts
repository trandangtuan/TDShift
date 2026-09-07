import type { ModelDefinition } from "@record-platform/core";

export const actionModel: ModelDefinition = {
  technicalName: "core.action",
  name: "Hành động",
  tableName: "core_action",
  fields: [
    { name: "technical_name", label: "Kỹ thuật Name", type: "char", required: true, sequence: 10 },
    { name: "name", label: "Tên", type: "char", required: true, sequence: 20 },
    { name: "type", label: "Loại", type: "char", required: true, sequence: 30 },
    { name: "model", label: "Model", type: "char", sequence: 40 },
    { name: "view_modes", label: "Chế độ view", type: "json", sequence: 50 }
  ]
};

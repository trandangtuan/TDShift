import type { ModelDefinition } from "@record-platform/core";

export const modelModel: ModelDefinition = {
  technicalName: "core.model",
  name: "Model",
  tableName: "core_model",
  fields: [
    { name: "technical_name", label: "Kỹ thuật Name", type: "char", required: true, indexed: true, sequence: 10 },
    { name: "name", label: "Tên", type: "char", required: true, sequence: 20 },
    { name: "table_name", label: "Tên bảng", type: "char", required: true, sequence: 30 },
    { name: "module", label: "Module", type: "char", required: true, sequence: 40 },
    { name: "is_custom", label: "Tùy chỉnh", type: "boolean", sequence: 50 }
  ]
};

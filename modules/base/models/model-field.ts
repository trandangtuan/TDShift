import type { ModelDefinition } from "@record-platform/core";

export const modelFieldModel: ModelDefinition = {
  technicalName: "core.model.field",
  name: "Field",
  tableName: "core_model_field",
  fields: [
    { name: "model", label: "Model", type: "char", required: true, indexed: true, sequence: 10 },
    { name: "name", label: "Tên", type: "char", required: true, sequence: 20 },
    { name: "label", label: "Label", type: "char", required: true, sequence: 30 },
    { name: "type", label: "Loại", type: "char", required: true, sequence: 40 },
    { name: "required", label: "Bắt buộc", type: "boolean", sequence: 50 },
    { name: "relation_model", label: "Model liên kết", type: "char", sequence: 60 },
    { name: "is_custom", label: "Tùy chỉnh", type: "boolean", sequence: 70 }
  ]
};

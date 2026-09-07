import type { ModelDefinition } from "@record-platform/core";

export const viewModel: ModelDefinition = {
  technicalName: "core.view",
  name: "View",
  tableName: "core_view",
  fields: [
    { name: "technical_name", label: "Kỹ thuật Name", type: "char", required: true, sequence: 10 },
    { name: "name", label: "Tên", type: "char", required: true, sequence: 20 },
    { name: "model", label: "Model", type: "char", required: true, sequence: 30 },
    { name: "type", label: "Loại", type: "char", required: true, sequence: 40 },
    {
      name: "content_type",
      label: "Loại nội dung",
      type: "selection",
      required: true,
      defaultValue: "json",
      selectionOptions: [
        { label: "JSON", value: "json" },
        { label: "HTML", value: "html" },
        { label: "XML", value: "xml" }
      ],
      sequence: 50
    },
    { name: "content", label: "Nội dung", type: "text", sequence: 60 },
    { name: "architecture", label: "Kiến trúc", type: "json", required: true, sequence: 70 }
  ]
};

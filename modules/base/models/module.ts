import type { ModelDefinition } from "@record-platform/core";

export const moduleModel: ModelDefinition = {
  technicalName: "core.module",
  name: "Module",
  tableName: "core_module",
  fields: [
    { name: "technical_name", label: "Kỹ thuật Name", type: "char", required: true, indexed: true, sequence: 10 },
    { name: "display_name", label: "Tên hiển thị", type: "char", required: true, sequence: 20 },
    { name: "version", label: "Phiên bản", type: "char", required: true, sequence: 30 },
    {
      name: "state",
      label: "Trạng thái",
      type: "selection",
      required: true,
      selectionOptions: [
        { label: "Chưa cài", value: "UNINSTALLED" },
        { label: "Đã cài", value: "INSTALLED" },
        { label: "Đã tắt", value: "DISABLED" }
      ],
      sequence: 40
    },
    { name: "installable", label: "Có thể cài", type: "boolean", sequence: 50 },
    { name: "auto_install", label: "Tự động cài", type: "boolean", sequence: 60 },
    { name: "sequence", label: "Thứ tự", type: "integer", sequence: 70 }
  ]
};

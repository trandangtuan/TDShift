import type { ModelDefinition } from "@record-platform/core";

export const menuModel: ModelDefinition = {
  technicalName: "core.menu",
  name: "Menu",
  tableName: "core_menu",
  fields: [
    { name: "technical_name", label: "Kỹ thuật Name", type: "char", required: true, sequence: 10 },
    { name: "name", label: "Tên", type: "char", required: true, sequence: 20 },
    { name: "parent", label: "Cha", type: "char", sequence: 30 },
    { name: "action", label: "Hành động", type: "char", sequence: 40 },
    { name: "icon", label: "Biểu tượng", type: "char", sequence: 50 },
    { name: "sequence", label: "Thứ tự", type: "integer", sequence: 60 }
  ]
};

import type { ModelDefinition } from "@record-platform/core";

export const menuModel: ModelDefinition = {
  technicalName: "core.menu",
  name: "Menu",
  tableName: "core_menu",
  fields: [
    { name: "technical_name", label: "Technical Name", type: "char", required: true, sequence: 10 },
    { name: "name", label: "Name", type: "char", required: true, sequence: 20 },
    { name: "parent", label: "Parent", type: "char", sequence: 30 },
    { name: "action", label: "Action", type: "char", sequence: 40 },
    { name: "icon", label: "Icon", type: "char", sequence: 50 },
    { name: "sequence", label: "Sequence", type: "integer", sequence: 60 }
  ]
};

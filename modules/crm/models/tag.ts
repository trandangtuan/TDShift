import type { ModelDefinition } from "@record-platform/core";

export const crmTagModel: ModelDefinition = {
  technicalName: "crm.tag",
  name: "CRM Tag",
  tableName: "crm_tag",
  fields: [
    { name: "name", label: "Tag", type: "char", required: true, sequence: 10 },
    { name: "color", label: "Color", type: "char", defaultValue: "#0f766e", sequence: 20 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 30 }
  ]
};

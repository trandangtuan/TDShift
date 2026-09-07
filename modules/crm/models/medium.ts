import type { ModelDefinition } from "@record-platform/core";

export const crmMediumModel: ModelDefinition = {
  technicalName: "crm.medium",
  name: "Marketing Medium",
  tableName: "crm_medium",
  fields: [
    { name: "name", label: "Medium", type: "char", required: true, sequence: 10 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 20 }
  ]
};

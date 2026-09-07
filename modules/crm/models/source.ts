import type { ModelDefinition } from "@record-platform/core";

export const crmSourceModel: ModelDefinition = {
  technicalName: "crm.source",
  name: "Lead Source",
  tableName: "crm_source",
  fields: [
    { name: "name", label: "Source", type: "char", required: true, sequence: 10 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 20 }
  ]
};

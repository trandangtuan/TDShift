import type { ModelDefinition } from "@record-platform/core";

export const crmLostReasonModel: ModelDefinition = {
  technicalName: "crm.lost.reason",
  name: "Lost Reason",
  tableName: "crm_lost_reason",
  fields: [
    { name: "name", label: "Reason", type: "char", required: true, sequence: 10 },
    { name: "description", label: "Mô tả", type: "text", sequence: 20 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 30 }
  ]
};

import type { ModelDefinition } from "@record-platform/core";

export const crmCampaignModel: ModelDefinition = {
  technicalName: "crm.campaign",
  name: "Campaign",
  tableName: "crm_campaign",
  fields: [
    { name: "name", label: "Campaign", type: "char", required: true, sequence: 10 },
    { name: "start_date", label: "Start Date", type: "date", sequence: 20 },
    { name: "end_date", label: "End Date", type: "date", sequence: 30 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};

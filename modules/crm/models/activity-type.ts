import type { ModelDefinition } from "@record-platform/core";

export const crmActivityTypeModel: ModelDefinition = {
  technicalName: "crm.activity.type",
  name: "Activity Type",
  tableName: "crm_activity_type",
  fields: [
    { name: "name", label: "Activity Type", type: "char", required: true, sequence: 10 },
    { name: "category", label: "Category", type: "selection", defaultValue: "todo", selectionOptions: [{ label: "To Do", value: "todo" }, { label: "Call", value: "call" }, { label: "Email", value: "email" }, { label: "Meeting", value: "meeting" }, { label: "Upload Document", value: "upload" }], sequence: 20 },
    { name: "default_delay_days", label: "Default Delay Days", type: "integer", defaultValue: 0, sequence: 30 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};

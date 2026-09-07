import type { ViewDefinition } from "@record-platform/core";

export const crmActivityView: ViewDefinition[] = [
  { technicalName: "crm.activity.list", name: "CRM Activity", model: "crm.activity", type: "list", architecture: { type: "list", model: "crm.activity", fields: ["name", "lead_id", "activity_type_id", "assigned_user_id", "deadline", "state", "done_date"] } },
  {
    technicalName: "crm.activity.form",
    name: "Activity CRM",
    model: "crm.activity",
    type: "form",
    architecture: {
      type: "form",
      model: "crm.activity",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "lead_id" }, { type: "field", name: "activity_type_id" }, { type: "field", name: "assigned_user_id" }, { type: "field", name: "deadline" }, { type: "field", name: "state" }, { type: "field", name: "done_date" }, { type: "field", name: "note" }] }]
    }
  }
];

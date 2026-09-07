import type { ViewDefinition } from "@record-platform/core";

export const crmLeadView: ViewDefinition[] = [
  { technicalName: "crm.lead.list", name: "Pipeline", model: "crm.lead", type: "list", architecture: { type: "list", model: "crm.lead", fields: ["name", "type", "partner_id", "team_id", "user_id", "stage_id", "expected_revenue", "probability", "expected_closing", "priority", "state"] } },
  {
    technicalName: "crm.lead.form",
    name: "Lead / Cơ hội",
    model: "crm.lead",
    type: "form",
    architecture: {
      type: "form",
      model: "crm.lead",
      children: [
        {
          type: "group",
          children: [
            { type: "field", name: "name" },
            { type: "field", name: "type" },
            { type: "field", name: "partner_id" },
            { type: "field", name: "contact_name" },
            { type: "field", name: "email_from" },
            { type: "field", name: "phone" },
            { type: "field", name: "company_name" },
            { type: "field", name: "team_id" },
            { type: "field", name: "user_id" },
            { type: "field", name: "stage_id" },
            { type: "field", name: "tag_id" },
            { type: "field", name: "expected_revenue" },
            { type: "field", name: "probability" },
            { type: "field", name: "expected_closing" },
            { type: "field", name: "priority" },
            { type: "field", name: "state" },
            { type: "field", name: "quotation_count" },
            { type: "field", name: "active" }
          ]
        },
        {
          type: "notebook",
          children: [
            { type: "page", label: "Activity", children: [{ type: "group", children: [{ type: "field", name: "activity_ids" }] }] },
            { type: "page", label: "Marketing", children: [{ type: "group", children: [{ type: "field", name: "source_id" }, { type: "field", name: "medium_id" }, { type: "field", name: "campaign_id" }] }] },
            { type: "page", label: "Đã mất", children: [{ type: "group", children: [{ type: "field", name: "lost_reason_id" }, { type: "field", name: "lost_feedback" }] }] },
            { type: "page", label: "Ghi chú", children: [{ type: "group", children: [{ type: "field", name: "description" }] }] }
          ]
        }
      ]
    }
  }
];

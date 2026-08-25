import type { DataRecordDefinition } from "@record-platform/core";

export const crmConfigData: DataRecordDefinition[] = [
  { externalId: "crm.team_direct_sales", model: "crm.team", values: { name: "Direct Sales", email_alias: "sales", target_revenue: 500000000, sequence: 10, active: true } },
  { externalId: "crm.stage_new", model: "crm.stage", values: { name: "New", sequence: 10, probability: 10, stage_type: "new", fold: false, active: true } },
  { externalId: "crm.stage_qualified", model: "crm.stage", values: { name: "Qualified", sequence: 20, probability: 30, stage_type: "open", fold: false, active: true } },
  { externalId: "crm.stage_proposition", model: "crm.stage", values: { name: "Proposition", sequence: 30, probability: 60, stage_type: "open", fold: false, active: true } },
  { externalId: "crm.stage_won", model: "crm.stage", values: { name: "Won", sequence: 90, probability: 100, stage_type: "won", fold: true, active: true } },
  { externalId: "crm.stage_lost", model: "crm.stage", values: { name: "Lost", sequence: 100, probability: 0, stage_type: "lost", fold: true, active: true } },
  { externalId: "crm.tag_vip", model: "crm.tag", values: { name: "VIP", color: "#0f766e", active: true } },
  { externalId: "crm.tag_erp", model: "crm.tag", values: { name: "ERP", color: "#2563eb", active: true } },
  { externalId: "crm.activity_type_call", model: "crm.activity.type", values: { name: "Call", category: "call", default_delay_days: 0, active: true } },
  { externalId: "crm.activity_type_email", model: "crm.activity.type", values: { name: "Email", category: "email", default_delay_days: 1, active: true } },
  { externalId: "crm.activity_type_meeting", model: "crm.activity.type", values: { name: "Meeting", category: "meeting", default_delay_days: 3, active: true } },
  { externalId: "crm.source_website", model: "crm.source", values: { name: "Website", active: true } },
  { externalId: "crm.source_referral", model: "crm.source", values: { name: "Referral", active: true } },
  { externalId: "crm.medium_email", model: "crm.medium", values: { name: "Email", active: true } },
  { externalId: "crm.medium_phone", model: "crm.medium", values: { name: "Phone", active: true } },
  { externalId: "crm.campaign_q3", model: "crm.campaign", values: { name: "Q3 Growth Campaign", start_date: "2026-07-01", end_date: "2026-09-30", active: true } },
  { externalId: "crm.lost_reason_price", model: "crm.lost.reason", values: { name: "Price", description: "Customer selected a lower-priced option.", active: true } },
  { externalId: "crm.lost_reason_no_budget", model: "crm.lost.reason", values: { name: "No Budget", description: "Customer does not have budget in this period.", active: true } },
  { externalId: "crm.lost_reason_competitor", model: "crm.lost.reason", values: { name: "Competitor", description: "Customer selected another vendor.", active: true } }
];

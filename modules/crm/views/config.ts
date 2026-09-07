import type { ViewDefinition } from "@record-platform/core";

const configs = [
  ["crm.team", "Bán hàng Teams", "Bán hàng Team", ["name", "leader_id", "email_alias", "target_revenue", "sequence", "active"]],
  ["crm.stage", "Stage", "Stage", ["sequence", "name", "stage_type", "probability", "team_id", "fold", "active"]],
  ["crm.tag", "Tag", "Tag", ["name", "color", "active"]],
  ["crm.activity.type", "Loại hoạt động", "Activity Type", ["name", "category", "default_delay_days", "active"]],
  ["crm.lost.reason", "Lý do mất", "Lost Reason", ["name", "description", "active"]],
  ["crm.source", "Nguồn lead", "Lead Source", ["name", "active"]],
  ["crm.medium", "Kênh marketing", "Marketing Medium", ["name", "active"]],
  ["crm.campaign", "Campaign", "Campaign", ["name", "start_date", "end_date", "active"]]
] as const;

export const crmConfigView: ViewDefinition[] = configs.flatMap(([model, listName, formName, fields]) => [
  {
    technicalName: `${model}.list`,
    name: listName,
    model,
    type: "list",
    architecture: { type: "list", model, fields: [...fields] }
  },
  {
    technicalName: `${model}.form`,
    name: formName,
    model,
    type: "form",
    architecture: {
      type: "form",
      model,
      children: [{ type: "group", children: fields.map((name) => ({ type: "field", name })) }]
    }
  }
]);

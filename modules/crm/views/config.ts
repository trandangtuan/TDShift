import type { ViewDefinition } from "@record-platform/core";

const configs = [
  ["crm.team", "Sales Teams", "Sales Team", ["name", "leader_id", "email_alias", "target_revenue", "sequence", "active"]],
  ["crm.stage", "Stages", "Stage", ["sequence", "name", "stage_type", "probability", "team_id", "fold", "active"]],
  ["crm.tag", "Tags", "Tag", ["name", "color", "active"]],
  ["crm.activity.type", "Activity Types", "Activity Type", ["name", "category", "default_delay_days", "active"]],
  ["crm.lost.reason", "Lost Reasons", "Lost Reason", ["name", "description", "active"]],
  ["crm.source", "Lead Sources", "Lead Source", ["name", "active"]],
  ["crm.medium", "Marketing Media", "Marketing Medium", ["name", "active"]],
  ["crm.campaign", "Campaigns", "Campaign", ["name", "start_date", "end_date", "active"]]
] as const;

export const crmConfigViews: ViewDefinition[] = configs.flatMap(([model, listName, formName, fields]) => [
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

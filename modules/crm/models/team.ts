import type { ModelDefinition } from "@record-platform/core";

export const crmTeamModel: ModelDefinition = {
  technicalName: "crm.team",
  name: "Sales Team",
  tableName: "crm_team",
  fields: [
    { name: "name", label: "Team", type: "char", required: true, sequence: 10 },
    { name: "leader_id", label: "Team Leader", type: "many2one", relationModel: "core.user", sequence: 20 },
    { name: "email_alias", label: "Email Alias", type: "char", sequence: 30 },
    { name: "target_revenue", label: "Target Revenue", type: "decimal", defaultValue: 0, sequence: 40 },
    { name: "sequence", label: "Sequence", type: "integer", defaultValue: 10, sequence: 50 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 60 }
  ]
};

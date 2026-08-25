import type { ModelDefinition } from "@record-platform/core";

export const crmStageModel: ModelDefinition = {
  technicalName: "crm.stage",
  name: "CRM Stage",
  tableName: "crm_stage",
  fields: [
    { name: "name", label: "Stage", type: "char", required: true, sequence: 10 },
    { name: "sequence", label: "Sequence", type: "integer", defaultValue: 10, sequence: 20 },
    { name: "probability", label: "Probability %", type: "decimal", defaultValue: 0, sequence: 30 },
    { name: "fold", label: "Folded", type: "boolean", defaultValue: false, sequence: 40 },
    {
      name: "stage_type",
      label: "Stage Type",
      type: "selection",
      defaultValue: "open",
      selectionOptions: [
        { label: "New", value: "new" },
        { label: "Open", value: "open" },
        { label: "Won", value: "won" },
        { label: "Lost", value: "lost" }
      ],
      sequence: 50
    },
    { name: "team_id", label: "Sales Team", type: "many2one", relationModel: "crm.team", sequence: 60 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 70 }
  ]
};

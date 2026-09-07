import type { ModelDefinition } from "@record-platform/core";

export const crmStageModel: ModelDefinition = {
  technicalName: "crm.stage",
  name: "CRM Stage",
  tableName: "crm_stage",
  fields: [
    { name: "name", label: "Stage", type: "char", required: true, sequence: 10 },
    { name: "sequence", label: "Thứ tự", type: "integer", defaultValue: 10, sequence: 20 },
    { name: "probability", label: "Xác suất %", type: "decimal", defaultValue: 0, sequence: 30 },
    { name: "fold", label: "Folded", type: "boolean", defaultValue: false, sequence: 40 },
    {
      name: "stage_type",
      label: "Stage Type",
      type: "selection",
      defaultValue: "open",
      selectionOptions: [
        { label: "New", value: "new" },
        { label: "Open", value: "open" },
        { label: "Thắng", value: "won" },
        { label: "Đã mất", value: "lost" }
      ],
      sequence: 50
    },
    { name: "team_id", label: "Bán hàng Team", type: "many2one", relationModel: "crm.team", sequence: 60 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 70 }
  ]
};

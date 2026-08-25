import type { ModelDefinition } from "@record-platform/core";

export const accountMoveLineModel: ModelDefinition = {
  technicalName: "account.move.line",
  name: "Journal Item",
  tableName: "account_move_line",
  fields: [
    { name: "move_id", label: "Journal Entry", type: "many2one", relationModel: "account.move", required: true, indexed: true, sequence: 10 },
    { name: "account_id", label: "Account", type: "many2one", relationModel: "account.account", required: true, sequence: 20 },
    { name: "partner_id", label: "Partner", type: "many2one", relationModel: "res.partner", sequence: 30 },
    { name: "name", label: "Label", type: "char", sequence: 40 },
    { name: "debit", label: "Debit", type: "decimal", defaultValue: 0, sequence: 50 },
    { name: "credit", label: "Credit", type: "decimal", defaultValue: 0, sequence: 60 },
    { name: "date", label: "Date", type: "date", sequence: 70 }
  ]
};

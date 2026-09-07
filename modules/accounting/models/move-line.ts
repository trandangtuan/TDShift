import type { ModelDefinition } from "@record-platform/core";

export const accountMoveLineModel: ModelDefinition = {
  technicalName: "account.move.line",
  name: "Dòng bút toán",
  tableName: "account_move_line",
  fields: [
    { name: "move_id", label: "Bút toán", type: "many2one", relationModel: "account.move", required: true, indexed: true, sequence: 10 },
    { name: "account_id", label: "Tài khoản", type: "many2one", relationModel: "account.account", required: true, sequence: 20 },
    { name: "partner_id", label: "Đối tác", type: "many2one", relationModel: "res.partner", sequence: 30 },
    { name: "name", label: "Label", type: "char", sequence: 40 },
    { name: "debit", label: "Nợ", type: "decimal", defaultValue: 0, sequence: 50 },
    { name: "credit", label: "Có", type: "decimal", defaultValue: 0, sequence: 60 },
    { name: "date", label: "Ngày", type: "date", sequence: 70 }
  ]
};

import type { ViewDefinition } from "@record-platform/core";

export const accountMoveLineView: ViewDefinition[] = [
  { technicalName: "account.move.line.list", name: "MoveLine", model: "account.move.line", type: "list", architecture: { type: "list", model: "account.move.line", fields: ["date", "move_id", "account_id", "partner_id", "name", "debit", "credit"] } },
  {
    technicalName: "account.move.line.form",
    name: "Dòng bút toán",
    model: "account.move.line",
    type: "form",
    architecture: {
      type: "form",
      model: "account.move.line",
      children: [{ type: "group", children: [{ type: "field", name: "move_id" }, { type: "field", name: "date" }, { type: "field", name: "account_id" }, { type: "field", name: "partner_id" }, { type: "field", name: "name" }, { type: "field", name: "debit" }, { type: "field", name: "credit" }] }]
    }
  }
];

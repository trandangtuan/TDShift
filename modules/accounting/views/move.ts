import type { ViewDefinition } from "@record-platform/core";

export const accountMoveView: ViewDefinition[] = [
  { technicalName: "account.move.list", name: "Move", model: "account.move", type: "list", architecture: { type: "list", model: "account.move", fields: ["name", "date", "move_type", "journal_id", "partner_id", "source_document", "state", "amount_debit", "amount_credit"] } },
  {
    technicalName: "account.move.form",
    name: "Bút toán",
    model: "account.move",
    type: "form",
    architecture: {
      type: "form",
      model: "account.move",
      children: [
        { type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "date" }, { type: "field", name: "move_type" }, { type: "field", name: "journal_id" }, { type: "field", name: "partner_id" }, { type: "field", name: "ref" }, { type: "field", name: "source_document" }, { type: "field", name: "state" }, { type: "field", name: "amount_debit" }, { type: "field", name: "amount_credit" }, { type: "field", name: "line_ids" }] }
      ]
    }
  }
];

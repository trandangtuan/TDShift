import type { ViewDefinition } from "@record-platform/core";

export const accountView: ViewDefinition[] = [
  { technicalName: "account.account.list", name: "Tài khoản", model: "account.account", type: "list", architecture: { type: "list", model: "account.account", fields: ["code", "name", "type", "parent_id", "level", "reconcile", "active"] } },
  {
    technicalName: "account.account.form",
    name: "Tài khoản",
    model: "account.account",
    type: "form",
    architecture: {
      type: "form",
      model: "account.account",
      children: [
        { type: "group", children: [{ type: "field", name: "code" }, { type: "field", name: "name" }, { type: "field", name: "type" }, { type: "field", name: "parent_id" }, { type: "field", name: "level" }, { type: "field", name: "reconcile" }, { type: "field", name: "active" }, { type: "field", name: "note" }] }
      ]
    }
  }
];

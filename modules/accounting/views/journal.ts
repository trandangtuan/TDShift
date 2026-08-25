import type { ViewDefinition } from "@record-platform/core";

export const journalViews: ViewDefinition[] = [
  { technicalName: "account.journal.list", name: "Journals", model: "account.journal", type: "list", architecture: { type: "list", model: "account.journal", fields: ["code", "name", "type", "active"] } },
  {
    technicalName: "account.journal.form",
    name: "Journal",
    model: "account.journal",
    type: "form",
    architecture: {
      type: "form",
      model: "account.journal",
      children: [{ type: "group", children: [{ type: "field", name: "code" }, { type: "field", name: "name" }, { type: "field", name: "type" }, { type: "field", name: "active" }] }]
    }
  }
];

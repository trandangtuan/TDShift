import type { ModelDefinition } from "@record-platform/core";

export const journalModel: ModelDefinition = {
  technicalName: "account.journal",
  name: "Accounting Journal",
  tableName: "account_journal",
  fields: [
    { name: "code", label: "Code", type: "char", required: true, indexed: true, unique: true, sequence: 10 },
    { name: "name", label: "Name", type: "char", required: true, sequence: 20 },
    {
      name: "type",
      label: "Type",
      type: "selection",
      defaultValue: "general",
      selectionOptions: [
        { label: "General", value: "general" },
        { label: "Sales", value: "sale" },
        { label: "Purchases", value: "purchase" },
        { label: "Cash", value: "cash" },
        { label: "Bank", value: "bank" }
      ],
      sequence: 30
    },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};

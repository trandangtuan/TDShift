import type { ModelDefinition } from "@record-platform/core";

export const journalModel: ModelDefinition = {
  technicalName: "account.journal",
  name: "Accounting Journal",
  tableName: "account_journal",
  fields: [
    { name: "code", label: "Mã", type: "char", required: true, indexed: true, unique: true, sequence: 10 },
    { name: "name", label: "Tên", type: "char", required: true, sequence: 20 },
    {
      name: "type",
      label: "Loại",
      type: "selection",
      defaultValue: "general",
      selectionOptions: [
        { label: "General", value: "general" },
        { label: "Bán hàng", value: "sale" },
        { label: "Mua hàng", value: "purchase" },
        { label: "Cash", value: "cash" },
        { label: "Bank", value: "bank" }
      ],
      sequence: 30
    },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};

import type { ModelDefinition } from "@record-platform/core";

export const accountModel: ModelDefinition = {
  technicalName: "account.account",
  name: "Tài khoản",
  tableName: "account_account",
  fields: [
    { name: "code", label: "Mã", type: "char", required: true, indexed: true, unique: true, sequence: 10 },
    { name: "name", label: "Tên", type: "char", required: true, sequence: 20 },
    {
      name: "type",
      label: "Loại",
      type: "selection",
      required: true,
      selectionOptions: [
        { label: "Asset", value: "asset" },
        { label: "Liability", value: "liability" },
        { label: "Equity", value: "equity" },
        { label: "Revenue", value: "revenue" },
        { label: "Expense", value: "expense" },
        { label: "Income", value: "income" },
        { label: "Off Số dư", value: "off_balance" }
      ],
      sequence: 30
    },
    { name: "parent_id", label: "Cha Account", type: "many2one", relationModel: "account.account", sequence: 40 },
    { name: "level", label: "Level", type: "integer", defaultValue: 1, sequence: 50 },
    { name: "reconcile", label: "Allow Reconciliation", type: "boolean", defaultValue: false, sequence: 60 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 70 },
    { name: "note", label: "Khôngte", type: "text", sequence: 80 }
  ]
};

import type { DataRecordDefinition } from "@record-platform/core";

export const journalData: DataRecordDefinition[] = [
  { externalId: "account.journal_general", model: "account.journal", values: { code: "GEN", name: "General Journal", type: "general", active: true } },
  { externalId: "account.journal_sales", model: "account.journal", values: { code: "SAL", name: "Sales Journal", type: "sale", active: true } },
  { externalId: "account.journal_purchase", model: "account.journal", values: { code: "PUR", name: "Purchase Journal", type: "purchase", active: true } },
  { externalId: "account.journal_cash", model: "account.journal", values: { code: "CSH", name: "Cash Journal", type: "cash", active: true } },
  { externalId: "account.journal_bank", model: "account.journal", values: { code: "BNK", name: "Bank Journal", type: "bank", active: true } }
];

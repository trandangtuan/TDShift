import type { DataRecordDefinition } from "@record-platform/core";

export const purchaseOrderData: DataRecordDefinition[] = [
  { externalId: "purchase.order_po001", model: "purchase.order", values: { name: "PO001", partner_id: 3, date_order: "2026-08-21", state: "draft" } }
];

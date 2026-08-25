import type { DataRecordDefinition } from "@record-platform/core";

export const orderData: DataRecordDefinition[] = [
  { externalId: "sale.order_so001", model: "sale.order", values: { name: "SO001", partner_id: 1, date_order: "2026-08-21", state: "draft", amount_total: 1200 } },
  { externalId: "sale.order_so002", model: "sale.order", values: { name: "SO002", partner_id: 2, date_order: "2026-08-21", state: "confirmed", amount_total: 860 } }
];

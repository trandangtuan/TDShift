import type { DataRecordDefinition } from "@record-platform/core";

export const purchaseOrderLineData: DataRecordDefinition[] = [
  { externalId: "purchase.order_po001_line_1", model: "purchase.order.line", values: { order_id: 1, product_id: 1, description: "Implementation Consulting", quantity: 2, price_unit: 900, price_subtotal: 1800 } }
];

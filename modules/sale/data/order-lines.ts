import type { DataRecordDefinition } from "@record-platform/core";

export const orderLineData: DataRecordDefinition[] = [
  { externalId: "sale.order_so001_line_1", model: "sale.order.line", values: { order_id: 1, product_id: 1, description: "Implementation Consulting", quantity: 1, price_unit: 1200, price_subtotal: 1200 } },
  { externalId: "sale.order_so002_line_1", model: "sale.order.line", values: { order_id: 2, product_id: 2, description: "Support Package", quantity: 1, price_unit: 860, price_subtotal: 860 } }
];

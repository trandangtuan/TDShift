import type { ViewDefinition } from "@record-platform/core";

export const saleorderLineView: ViewDefinition[] = [
  { technicalName: "sale.order.line.list", name: "Dòng đơn hàng", model: "sale.order.line", type: "list", architecture: { type: "list", model: "sale.order.line", fields: ["order_id", "product_id", "description", "quantity", "price_unit", "price_subtotal"] } },
  {
    technicalName: "sale.order.line.form",
    name: "Order Line",
    model: "sale.order.line",
    type: "form",
    architecture: {
      type: "form",
      model: "sale.order.line",
      children: [{ type: "group", children: [{ type: "field", name: "order_id" }, { type: "field", name: "product_id" }, { type: "field", name: "description" }, { type: "field", name: "quantity" }, { type: "field", name: "price_unit" }, { type: "field", name: "price_subtotal" }] }]
    }
  }
];

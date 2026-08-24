import type { ViewDefinition } from "@record-platform/core";

export const purchaseOrderLineViews: ViewDefinition[] = [
  { technicalName: "purchase.order.line.list", name: "Purchase Order Lines", model: "purchase.order.line", type: "list", architecture: { type: "list", model: "purchase.order.line", fields: ["order_id", "product_id", "description", "quantity", "price_unit", "price_subtotal"] } },
  {
    technicalName: "purchase.order.line.form",
    name: "Purchase Order Line",
    model: "purchase.order.line",
    type: "form",
    architecture: {
      type: "form",
      model: "purchase.order.line",
      children: [{ type: "group", children: [{ type: "field", name: "order_id" }, { type: "field", name: "product_id" }, { type: "field", name: "description" }, { type: "field", name: "quantity" }, { type: "field", name: "price_unit" }, { type: "field", name: "price_subtotal" }] }]
    }
  }
];

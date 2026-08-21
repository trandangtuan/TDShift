import type { ViewDefinition } from "@record-platform/core";

export const saleOrderViews: ViewDefinition[] = [
  { technicalName: "sale.order.list", name: "Orders", model: "sale.order", type: "list", architecture: { type: "list", model: "sale.order", fields: ["name", "partner_id", "date_order", "state", "amount_total"] } },
  {
    technicalName: "sale.order.form",
    name: "Order",
    model: "sale.order",
    type: "form",
    architecture: {
      type: "form",
      model: "sale.order",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "partner_id" }, { type: "field", name: "date_order" }, { type: "field", name: "state" }, { type: "field", name: "amount_total" }, { type: "field", name: "order_line" }] }]
    }
  }
];

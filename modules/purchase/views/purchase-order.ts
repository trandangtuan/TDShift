import type { ViewDefinition } from "@record-platform/core";

export const purchaseOrderView: ViewDefinition[] = [
  { technicalName: "purchase.order.list", name: "Mua hàng Order", model: "purchase.order", type: "list", architecture: { type: "list", model: "purchase.order", fields: ["name", "partner_id", "date_order", "state", "amount_total"] } },
  {
    technicalName: "purchase.order.form",
    name: "Mua hàng Order",
    model: "purchase.order",
    type: "form",
    architecture: {
      type: "form",
      model: "purchase.order",
      children: [
        { type: "group", children:
          [
            { type: "field", name: "name" },
            { type: "field", name: "partner_id" }, 
            { type: "field", name: "date_order" }, 
            { type: "field", name: "state" }, 
            { type: "field", name: "amount_total" }, 
            { type: "field", name: "order_line" }
          ]}
        ]
    }
  }
];

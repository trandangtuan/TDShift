import type { ViewExtensionDefinition } from "@record-platform/core";

export const saleOrderDiscountViewExtensions: ViewExtensionDefinition[] = [
  {
    technicalName: "sale_discount.order_form_discount",
    targetView: "sale.order.form",
    operation: "after",
    target: "partner_id",
    priority: 100,
    content: [
      { type: "field", name: "discount_percent" },
      { type: "field", name: "discount_amount" }
    ]
  }
];

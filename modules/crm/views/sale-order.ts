import type { ViewExtensionDefinition } from "@record-platform/core";

export const crmSaleOrderViewExtensions: ViewExtensionDefinition[] = [
  {
    technicalName: "crm.sale_order_list_opportunity",
    targetView: "sale.order.list",
    operation: "after",
    target: "partner_id",
    content: { type: "field", name: "opportunity_id" }
  },
  {
    technicalName: "crm.sale_order_form_opportunity",
    targetView: "sale.order.form",
    operation: "after",
    target: "partner_id",
    content: { type: "field", name: "opportunity_id" }
  }
];

import type { ViewExtensionDefinition } from "@record-platform/core";

export const stockProductViewExtensions: ViewExtensionDefinition[] = [
  {
    technicalName: "stock.product.form.qty_available",
    targetView: "product.product.form",
    operation: "after",
    target: "list_price",
    content: { type: "field", name: "qty_available" },
    priority: 20
  }
];

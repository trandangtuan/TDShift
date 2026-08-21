import type { ModelDefinition } from "@record-platform/core";

export const saleOrderLineModel: ModelDefinition = {
  technicalName: "sale.order.line",
  name: "Sale Order Line",
  tableName: "sale_order_line",
  fields: [
    { name: "order_id", label: "Order", type: "many2one", relationModel: "sale.order", required: true, indexed: true, sequence: 10 },
    { name: "product_id", label: "Product", type: "many2one", relationModel: "product.product", required: true, sequence: 20 },
    { name: "description", label: "Description", type: "char", sequence: 30 },
    { name: "quantity", label: "Quantity", type: "decimal", defaultValue: 1, sequence: 40 },
    { name: "price_unit", label: "Unit Price", type: "decimal", defaultValue: 0, sequence: 50 },
    { name: "price_subtotal", label: "Subtotal", type: "decimal", defaultValue: 0, readonly: true, sequence: 60 }
  ]
};

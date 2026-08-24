import type { ModelDefinition } from "@record-platform/core";

export const productModel: ModelDefinition = {
  technicalName: "product.product",
  name: "Product",
  tableName: "product_product",
  fields: [
    { name: "name", label: "Product", type: "char", required: true, sequence: 10 },
    { name: "default_code", label: "Internal Reference", type: "char", indexed: true, sequence: 20 },
    { name: "list_price", label: "Sales Price", type: "decimal", defaultValue: 0, sequence: 30 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};

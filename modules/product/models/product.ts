import type { ModelDefinition } from "@record-platform/core";

export const productModel: ModelDefinition = {
  technicalName: "product.product",
  name: "Sản phẩm",
  tableName: "product_product",
  fields: [
    { name: "name", label: "Sản phẩm", type: "char", required: true, sequence: 10 },
    { name: "default_code", label: "Nội bộ Reference", type: "char", indexed: true, sequence: 20 },
    { name: "list_price", label: "Giá bán", type: "decimal", defaultValue: 0, sequence: 30 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};

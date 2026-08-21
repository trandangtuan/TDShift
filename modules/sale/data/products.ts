import type { DataRecordDefinition } from "@record-platform/core";

export const productData: DataRecordDefinition[] = [
  { externalId: "sale.product_consulting", model: "product.product", values: { name: "Implementation Consulting", default_code: "SERV-001", list_price: 1200, active: true } },
  { externalId: "sale.product_support", model: "product.product", values: { name: "Support Package", default_code: "SERV-002", list_price: 860, active: true } }
];

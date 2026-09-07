import type { ViewDefinition } from "@record-platform/core";

export const productView: ViewDefinition[] = [
  { technicalName: "product.product.list", name: "Sản phẩm", model: "product.product", type: "list", architecture: { type: "list", model: "product.product", fields: ["name", "default_code", "list_price", "active"] } },
  {
    technicalName: "product.product.form",
    name: "Sản phẩm",
    model: "product.product",
    type: "form",
    architecture: {
      type: "form",
      model: "product.product",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "default_code" }, { type: "field", name: "list_price" }, { type: "field", name: "active" }] }]
    }
  }
];

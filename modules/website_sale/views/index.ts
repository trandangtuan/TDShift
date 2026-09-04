import type { ViewDefinition } from "@record-platform/core";

export const websiteSaleViews: ViewDefinition[] = [{
  technicalName: "website_sale.products.view",
  name: "Products Page",
  model: "website.page",
  type: "page",
  contentType: "html",
  content: "<section><p>Product catalog</p><h1>Khám phá sản phẩm</h1><p>Danh mục sản phẩm đang hoạt động của chúng tôi.</p></section>",
  architecture: { type: "form", model: "website.page", children: [] }
}];

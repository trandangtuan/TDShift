import type { DataRecordDefinition } from "@record-platform/core";

export const websiteSaleData: DataRecordDefinition[] = [
  {
    externalId: "website_sale.page_products",
    model: "website.page",
    values: {
      name: "Sản phẩm",
      slug: "products",
      url: "/products",
      title: "Product | MetaFlow",
      meta_description: "Khám phá danh mục sản phẩm của MetaFlow.",
      view_name: "website_sale.products.view",
      is_published: true,
      published_at: "2026-09-04T00:00:00.000Z",
      active: true
    }
  },
  {
    externalId: "website_sale.menu_products",
    model: "website.menu",
    values: {
      name: "Sản phẩm",
      label: "Sản phẩm",
      url: "/products",
      page_slug: "products",
      sequence: 25,
      is_published: true,
      active: true
    }
  }
];

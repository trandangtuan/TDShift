import type { DataRecordDefinition } from "@record-platform/core";

export const pageData: DataRecordDefinition[] = [
  {
    externalId: "website.page_home",
    model: "website.page",
    values: {
      name: "Home",
      slug: "home",
      url: "http://localhost:3100/",
      title: "MetaFlow",
      meta_description: "MetaFlow là ứng dụng quản trị doanh nghiệp có thể tải về, chỉnh sửa và mở rộng với bán hàng, mua hàng, kho, kế toán, website, tệp tin và AI.",
      view_name: "website.page_home.view",
      is_published: true,
      published_at: "2026-08-21T00:00:00.000Z",
      active: true
    }
  },
  {
    externalId: "website.page_features",
    model: "website.page",
    values: {
      name: "Features",
      slug: "features",
      url: "http://localhost:3100/features",
      title: "Tính năng",
      meta_description: "Giới thiệu chi tiết các tính năng hiện có của ứng dụng quản trị dữ liệu, bán hàng, mua hàng, kho, website và trợ lý AI.",
      view_name: "website.page_features.view",
      is_published: true,
      published_at: "2026-08-24T00:00:00.000Z",
      active: true
    }
  },
  {
    externalId: "website.page_module_guide",
    model: "website.page",
    values: {
      name: "Module Guide",
      slug: "module-guide",
      url: "http://localhost:3100/module-guide",
      title: "Hướng dẫn sử dụng module",
      meta_description: "Hướng dẫn sử dụng từng module trong MetaFlow: Base, Contacts, Product, CRM, Sale, Purchase, Stock, Accounting, Website, AI và MCP.",
      view_name: "website.page_module_guide.view",
      is_published: true,
      published_at: "2026-08-25T00:00:00.000Z",
      active: true
    }
  }
];

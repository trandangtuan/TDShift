import type { DataRecordDefinition } from "@record-platform/core";

export const pageData: DataRecordDefinition[] = [
  {
    externalId: "website.page_home",
    model: "website.page",
    values: {
      name: "Home",
      slug: "home",
      url: "http://localhost:3100/",
      title: "Record Platform",
      meta_description: "Nền tảng quản trị dữ liệu linh hoạt với liên hệ, bán hàng, mua hàng, kho, website và trợ lý AI kết nối dữ liệu.",
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
  }
];

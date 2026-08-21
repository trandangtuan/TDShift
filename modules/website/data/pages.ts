import type { DataRecordDefinition } from "@record-platform/core";

export const pageData: DataRecordDefinition[] = [
  {
    externalId: "website.page_home",
    model: "website.page",
    values: {
      name: "Home",
      slug: "home",
      url: "http://localhost:3100/",
      title: "Welcome",
      meta_description: "Welcome to the Record Platform website.",
      view_name: "website.page_home.view",
      is_published: true,
      published_at: "2026-08-21T00:00:00.000Z",
      active: true
    }
  }
];

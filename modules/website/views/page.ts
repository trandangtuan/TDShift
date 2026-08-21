import type { ViewDefinition } from "@record-platform/core";

export const pageViews: ViewDefinition[] = [
  {
    technicalName: "website.page_home.view",
    name: "Home Page Content",
    model: "website.page",
    type: "page",
    contentType: "html",
    content: "<h1>Welcome</h1><p>This page is rendered from a core.view HTML record.</p>",
    architecture: {
      type: "form",
      model: "website.page",
      children: []
    }
  },
  {
    technicalName: "website.page.list",
    name: "Pages",
    model: "website.page",
    type: "list",
    architecture: {
      type: "list",
      model: "website.page",
      fields: ["name", "slug", "url", "title", "view_name", "is_published", "published_at", "active"]
    }
  },
  {
    technicalName: "website.page.form",
    name: "Page",
    model: "website.page",
    type: "form",
    architecture: {
      type: "form",
      model: "website.page",
      children: [
        {
          type: "group",
          children: [
            { type: "field", name: "name" },
            { type: "field", name: "slug" },
            { type: "field", name: "url" },
            { type: "field", name: "title" },
            { type: "field", name: "meta_description" },
            { type: "field", name: "view_name" },
            { type: "field", name: "is_published" },
            { type: "field", name: "published_at" },
            { type: "field", name: "active" }
          ]
        }
      ]
    }
  }
];

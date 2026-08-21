import type { ViewDefinition } from "@record-platform/core";

export const websiteMenuViews: ViewDefinition[] = [
  {
    technicalName: "website.menu.list",
    name: "Website Menus",
    model: "website.menu",
    type: "list",
    architecture: {
      type: "list",
      model: "website.menu",
      fields: ["name", "label", "url", "page_slug", "parent_id", "sequence", "is_published", "active"]
    }
  },
  {
    technicalName: "website.menu.form",
    name: "Website Menu",
    model: "website.menu",
    type: "form",
    architecture: {
      type: "form",
      model: "website.menu",
      children: [
        {
          type: "group",
          children: [
            { type: "field", name: "name" },
            { type: "field", name: "label" },
            { type: "field", name: "url" },
            { type: "field", name: "page_slug" },
            { type: "field", name: "parent_id" },
            { type: "field", name: "sequence" },
            { type: "field", name: "is_published" },
            { type: "field", name: "active" }
          ]
        }
      ]
    }
  }
];

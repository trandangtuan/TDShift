import type { ModelDefinition } from "@record-platform/core";

export const pageModel: ModelDefinition = {
  technicalName: "website.page",
  name: "Website Page",
  tableName: "website_page",
  fields: [
    { name: "name", label: "Page Name", type: "char", required: true, sequence: 10 },
    { name: "slug", label: "Slug", type: "char", required: true, indexed: true, sequence: 20 },
    { name: "url", label: "URL", type: "char", readonly: true, sequence: 30 },
    { name: "title", label: "Title", type: "char", required: true, sequence: 40 },
    { name: "meta_description", label: "Meta Description", type: "text", sequence: 50 },
    { name: "view_name", label: "View", type: "char", required: true, sequence: 60 },
    { name: "is_published", label: "Published", type: "boolean", defaultValue: false, sequence: 70 },
    { name: "published_at", label: "Published At", type: "datetime", readonly: true, sequence: 80 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 90 }
  ]
};

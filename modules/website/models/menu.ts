import type { ModelDefinition } from "@record-platform/core";

export const websiteMenuModel: ModelDefinition = {
  technicalName: "website.menu",
  name: "Website Menu",
  tableName: "website_menu",
  fields: [
    { name: "name", label: "Menu Name", type: "char", required: true, sequence: 10 },
    { name: "label", label: "Label", type: "char", required: true, sequence: 20 },
    { name: "url", label: "URL", type: "char", required: true, sequence: 30 },
    { name: "page_slug", label: "Page Slug", type: "char", sequence: 40 },
    { name: "parent_id", label: "Parent Menu", type: "many2one", relationModel: "website.menu", sequence: 50 },
    { name: "sequence", label: "Sequence", type: "integer", defaultValue: 100, sequence: 60 },
    { name: "is_published", label: "Published", type: "boolean", defaultValue: true, sequence: 70 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 80 }
  ]
};

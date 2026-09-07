import type { ModelDefinition } from "@record-platform/core";

export const websiteMenuModel: ModelDefinition = {
  technicalName: "website.menu",
  name: "Menu website",
  tableName: "website_menu",
  fields: [
    { name: "name", label: "Menu Name", type: "char", required: true, sequence: 10 },
    { name: "label", label: "Label", type: "char", required: true, sequence: 20 },
    { name: "url", label: "URL", type: "char", required: true, sequence: 30 },
    { name: "page_slug", label: "Page Slug", type: "char", sequence: 40 },
    { name: "parent_id", label: "Cha Menu", type: "many2one", relationModel: "website.menu", sequence: 50 },
    { name: "sequence", label: "Thứ tự", type: "integer", defaultValue: 100, sequence: 60 },
    { name: "is_published", label: "Đã xuất bản", type: "boolean", defaultValue: true, sequence: 70 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 80 }
  ]
};

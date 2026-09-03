import type { ViewDefinition } from "@record-platform/core";

export const galleryViews: ViewDefinition[] = [
  { technicalName: "gallery.image.list", name: "Images", model: "gallery.image", type: "list", architecture: { type: "list", model: "gallery.image", fields: ["name", "filename", "mime_type", "size", "width", "height", "owner_id", "create_date"] } },
  { technicalName: "gallery.image.form", name: "Image", model: "gallery.image", type: "form", architecture: { type: "form", model: "gallery.image", children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "filename" }, { type: "field", name: "mime_type" }, { type: "field", name: "size" }, { type: "field", name: "width" }, { type: "field", name: "height" }, { type: "field", name: "owner_id" }] }] } }
];
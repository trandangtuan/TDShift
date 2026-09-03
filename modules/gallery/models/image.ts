import type { ModelDefinition } from "@record-platform/core";

export const galleryImageModel: ModelDefinition = {
  technicalName: "gallery.image",
  name: "Image",
  tableName: "gallery_image",
  fields: [
    { name: "name", label: "Name", type: "char", required: true, indexed: true, sequence: 10 },
    { name: "filename", label: "File Name", type: "char", required: true, sequence: 20 },
    { name: "mime_type", label: "MIME Type", type: "char", required: true, sequence: 30 },
    { name: "size", label: "Size", type: "integer", readonly: true, sequence: 40 },
    { name: "storage_path", label: "Storage Path", type: "char", readonly: true, indexed: true, sequence: 50 },
    { name: "width", label: "Width", type: "integer", readonly: true, sequence: 60 },
    { name: "height", label: "Height", type: "integer", readonly: true, sequence: 70 },
    { name: "owner_id", label: "Owner", type: "many2one", relationModel: "core.user", required: true, indexed: true, sequence: 80 }
  ]
};
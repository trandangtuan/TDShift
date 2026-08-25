import type { ViewDefinition } from "@record-platform/core";

export const attachmentViews: ViewDefinition[] = [
  { technicalName: "base.attachment.list", name: "Attachments", model: "ir.attachment", type: "list", architecture: { type: "list", model: "ir.attachment", fields: ["name", "file_name", "mime_type", "file_size", "storage", "bucket", "object_name", "res_model", "res_id", "public", "active"] } },
  {
    technicalName: "base.attachment.form",
    name: "Attachment",
    model: "ir.attachment",
    type: "form",
    architecture: {
      type: "form",
      model: "ir.attachment",
      children: [
        {
          type: "group",
          children: [
            { type: "field", name: "name" },
            { type: "field", name: "file_name" },
            { type: "field", name: "mime_type" },
            { type: "field", name: "file_size" },
            { type: "field", name: "checksum" },
            { type: "field", name: "storage" },
            { type: "field", name: "bucket" },
            { type: "field", name: "object_name" },
            { type: "field", name: "res_model" },
            { type: "field", name: "res_id" },
            { type: "field", name: "url" },
            { type: "field", name: "public" },
            { type: "field", name: "active" },
            { type: "field", name: "description" },
            { type: "field", name: "datas" }
          ]
        }
      ]
    }
  }
];

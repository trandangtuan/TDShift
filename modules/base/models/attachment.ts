import type { ModelDefinition } from "@record-platform/core";

export const attachmentModel: ModelDefinition = {
  technicalName: "ir.attachment",
  name: "Attachment",
  tableName: "ir_attachment",
  fields: [
    { name: "name", label: "Name", type: "char", required: true, indexed: true, sequence: 10 },
    { name: "res_model", label: "Related Model", type: "char", indexed: true, sequence: 20 },
    { name: "res_id", label: "Related Record ID", type: "integer", indexed: true, sequence: 30 },
    { name: "file_name", label: "File Name", type: "char", sequence: 40 },
    { name: "mime_type", label: "MIME Type", type: "char", sequence: 50 },
    { name: "file_size", label: "File Size", type: "integer", readonly: true, sequence: 60 },
    { name: "checksum", label: "Checksum", type: "char", readonly: true, indexed: true, sequence: 70 },
    {
      name: "storage",
      label: "Storage",
      type: "selection",
      required: true,
      defaultValue: "db",
      selectionOptions: [
        { label: "Database", value: "db" },
        { label: "MinIO", value: "minio" },
        { label: "URL", value: "url" }
      ],
      sequence: 80
    },
    { name: "bucket", label: "Bucket", type: "char", readonly: true, sequence: 90 },
    { name: "object_name", label: "Object Name", type: "char", readonly: true, indexed: true, sequence: 100 },
    { name: "datas", label: "File Data", type: "text", sequence: 110 },
    { name: "url", label: "URL", type: "char", sequence: 120 },
    { name: "description", label: "Description", type: "text", sequence: 130 },
    { name: "public", label: "Public", type: "boolean", defaultValue: false, sequence: 140 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 150 }
  ]
};

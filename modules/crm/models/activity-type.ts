import type { ModelDefinition } from "@record-platform/core";

export const crmActivityTypeModel: ModelDefinition = {
  technicalName: "crm.activity.type",
  name: "Activity Type",
  tableName: "crm_activity_type",
  fields: [
    { name: "name", label: "Activity Type", type: "char", required: true, sequence: 10 },
    { name: "category", label: "Danh mục", type: "selection", defaultValue: "todo", selectionOptions: [{ label: "Cần làm", value: "todo" }, { label: "Gọi điện", value: "call" }, { label: "Email", value: "email" }, { label: "Cuộc họp", value: "meeting" }, { label: "Tải tài liệu", value: "upload" }], sequence: 20 },
    { name: "default_delay_days", label: "Số ngày trễ default", type: "integer", defaultValue: 0, sequence: 30 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};

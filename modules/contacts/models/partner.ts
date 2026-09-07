import type { ModelDefinition } from "@record-platform/core";

export const partnerModel: ModelDefinition = {
  technicalName: "res.partner",
  name: "Liên hệ",
  tableName: "res_partner",
  fields: [
    { name: "name", label: "Tên", type: "char", required: true, sequence: 10 },
    { name: "email", label: "Email", type: "char", sequence: 20 },
    { name: "phone", label: "Điện thoại", type: "char", sequence: 30 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};

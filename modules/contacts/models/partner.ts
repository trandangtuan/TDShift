import type { ModelDefinition } from "@record-platform/core";

export const partnerModel: ModelDefinition = {
  technicalName: "res.partner",
  name: "Contact",
  tableName: "res_partner",
  fields: [
    { name: "name", label: "Name", type: "char", required: true, sequence: 10 },
    { name: "email", label: "Email", type: "char", sequence: 20 },
    { name: "phone", label: "Phone", type: "char", sequence: 30 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};

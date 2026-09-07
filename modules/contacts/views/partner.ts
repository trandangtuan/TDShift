import type { ViewDefinition } from "@record-platform/core";

export const partnerView: ViewDefinition[] = [
  { technicalName: "contacts.partner.list", name: "Liên hệ", model: "res.partner", type: "list", architecture: { type: "list", model: "res.partner", fields: ["name", "email", "phone", "active"] } },
  {
    technicalName: "contacts.partner.form",
    name: "Liên hệ",
    model: "res.partner",
    type: "form",
    architecture: {
      type: "form",
      model: "res.partner",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "email" }, { type: "field", name: "phone" }, { type: "field", name: "active" }] }]
    }
  }
];

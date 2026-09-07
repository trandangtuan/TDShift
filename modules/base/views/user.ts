import type { ViewDefinition } from "@record-platform/core";

export const userView: ViewDefinition[] = [
  { technicalName: "base.user.list", name: "Người dùng", model: "core.user", type: "list", architecture: { type: "list", model: "core.user", fields: ["login", "name", "email", "phone", "active"] } },
  {
    technicalName: "base.user.form",
    name: "Người dùng",
    model: "core.user",
    type: "form",
    architecture: {
      type: "form",
      model: "core.user",
      children: [{ type: "group", children: [{ type: "field", name: "login" }, { type: "field", name: "name" }, { type: "field", name: "email" }, { type: "field", name: "phone" }, { type: "field", name: "password" }, { type: "field", name: "token_version" }, { type: "field", name: "api_token" }, { type: "field", name: "active" }] }]
    }
  }
];

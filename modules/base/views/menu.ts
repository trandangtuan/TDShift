import type { ViewDefinition } from "@record-platform/core";

export const menuView: ViewDefinition[] = [
  { technicalName: "base.menu.list", name: "Menu", model: "core.menu", type: "list", architecture: { type: "list", model: "core.menu", fields: ["technical_name", "name", "parent", "action", "icon", "sequence"] } },
  {
    technicalName: "base.menu.form",
    name: "Menu",
    model: "core.menu",
    type: "form",
    architecture: {
      type: "form",
      model: "core.menu",
      children: [{ type: "group", children: [{ type: "field", name: "technical_name" }, { type: "field", name: "name" }, { type: "field", name: "parent" }, { type: "field", name: "action" }, { type: "field", name: "icon" }, { type: "field", name: "sequence" }] }]
    }
  }
];

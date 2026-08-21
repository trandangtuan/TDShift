import type { ViewDefinition } from "@record-platform/core";

export const viewViews: ViewDefinition[] = [
  { technicalName: "base.view.list", name: "Views", model: "core.view", type: "list", architecture: { type: "list", model: "core.view", fields: ["technical_name", "name", "model", "type", "content_type", "architecture"] } },
  {
    technicalName: "base.view.form",
    name: "View",
    model: "core.view",
    type: "form",
    architecture: {
      type: "form",
      model: "core.view",
      children: [{ type: "group", children: [{ type: "field", name: "technical_name" }, { type: "field", name: "name" }, { type: "field", name: "model" }, { type: "field", name: "type" }, { type: "field", name: "content_type" }, { type: "field", name: "content" }, { type: "field", name: "architecture" }] }]
    }
  }
];

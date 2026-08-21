import type { ViewDefinition } from "@record-platform/core";

export const modelViews: ViewDefinition[] = [
  { technicalName: "base.model.list", name: "Models", model: "core.model", type: "list", architecture: { type: "list", model: "core.model", fields: ["technical_name", "name", "table_name", "module", "is_custom"] } },
  {
    technicalName: "base.model.form",
    name: "Model",
    model: "core.model",
    type: "form",
    architecture: {
      type: "form",
      model: "core.model",
      children: [{ type: "group", children: [{ type: "field", name: "technical_name" }, { type: "field", name: "name" }, { type: "field", name: "table_name" }, { type: "field", name: "module" }, { type: "field", name: "is_custom" }] }]
    }
  }
];

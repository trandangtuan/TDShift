import type { ViewDefinition } from "@record-platform/core";

export const modelFieldViews: ViewDefinition[] = [
  { technicalName: "base.field.list", name: "Fields", model: "core.model.field", type: "list", architecture: { type: "list", model: "core.model.field", fields: ["model", "name", "label", "type", "required", "relation_model", "is_custom"] } },
  {
    technicalName: "base.field.form",
    name: "Field",
    model: "core.model.field",
    type: "form",
    architecture: {
      type: "form",
      model: "core.model.field",
      children: [{ type: "group", children: [{ type: "field", name: "model" }, { type: "field", name: "name" }, { type: "field", name: "label" }, { type: "field", name: "type" }, { type: "field", name: "required" }, { type: "field", name: "relation_model" }, { type: "field", name: "is_custom" }] }]
    }
  }
];

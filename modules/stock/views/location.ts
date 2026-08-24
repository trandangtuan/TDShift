import type { ViewDefinition } from "@record-platform/core";

export const stockLocationViews: ViewDefinition[] = [
  { technicalName: "stock.location.list", name: "Locations", model: "stock.location", type: "list", architecture: { type: "list", model: "stock.location", fields: ["name", "usage", "active"] } },
  {
    technicalName: "stock.location.form",
    name: "Location",
    model: "stock.location",
    type: "form",
    architecture: { type: "form", model: "stock.location", children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "usage" }, { type: "field", name: "active" }] }] }
  }
];

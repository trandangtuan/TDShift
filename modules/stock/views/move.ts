import type { ViewDefinition } from "@record-platform/core";

export const stockMoveView: ViewDefinition[] = [
  { technicalName: "stock.move.list", name: "Dịch chuyển kho", model: "stock.move", type: "list", architecture: { type: "list", model: "stock.move", fields: ["name", "product_id", "quantity", "source_location_id", "dest_location_id", "state", "origin", "date"] } },
  {
    technicalName: "stock.move.form",
    name: "Dịch chuyển kho",
    model: "stock.move",
    type: "form",
    architecture: {
      type: "form",
      model: "stock.move",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "product_id" }, { type: "field", name: "quantity" }, { type: "field", name: "source_location_id" }, { type: "field", name: "dest_location_id" }, { type: "field", name: "state" }, { type: "field", name: "origin" }, { type: "field", name: "date" }] }]
    }
  }
];

import type { ModelDefinition } from "@record-platform/core";

export const stockLocationModel: ModelDefinition = {
  technicalName: "stock.location",
  name: "Stock Location",
  tableName: "stock_location",
  fields: [
    { name: "name", label: "Location", type: "char", required: true, sequence: 10 },
    {
      name: "usage",
      label: "Usage",
      type: "selection",
      required: true,
      defaultValue: "internal",
      selectionOptions: [
        { label: "Internal", value: "internal" },
        { label: "Supplier", value: "supplier" },
        { label: "Customer", value: "customer" },
        { label: "Inventory", value: "inventory" }
      ],
      sequence: 20
    },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 30 }
  ]
};

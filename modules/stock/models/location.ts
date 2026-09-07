import type { ModelDefinition } from "@record-platform/core";

export const stockLocationModel: ModelDefinition = {
  technicalName: "stock.location",
  name: "Stock Location",
  tableName: "stock_location",
  fields: [
    { name: "name", label: "Vị trí", type: "char", required: true, sequence: 10 },
    {
      name: "usage",
      label: "Cách dùng",
      type: "selection",
      required: true,
      defaultValue: "internal",
      selectionOptions: [
        { label: "Nội bộ", value: "internal" },
        { label: "Nhà cung cấp", value: "supplier" },
        { label: "Khách hàng", value: "customer" },
        { label: "Stock", value: "inventory" }
      ],
      sequence: 20
    },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 30 }
  ]
};

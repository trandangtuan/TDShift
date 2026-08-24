import type { DataRecordDefinition } from "@record-platform/core";

export const stockLocationData: DataRecordDefinition[] = [
  { externalId: "stock.location_supplier", model: "stock.location", values: { name: "Vendors", usage: "supplier", active: true } },
  { externalId: "stock.location_stock", model: "stock.location", values: { name: "Stock", usage: "internal", active: true } },
  { externalId: "stock.location_customer", model: "stock.location", values: { name: "Customers", usage: "customer", active: true } }
];

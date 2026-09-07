import type { DataRecordDefinition } from "@record-platform/core";

export const stockMoveData: DataRecordDefinition[] = [
  { externalId: "stock.move_initial_consulting", model: "stock.move", values: { name: "INIT-SERV-001", product_id: 1, quantity: 5, source_location_id: 1, dest_location_id: 2, state: "done", origin: "Initial Stock", date: "2026-08-21" } },
  { externalId: "stock.move_initial_support", model: "stock.move", values: { name: "INIT-SERV-002", product_id: 2, quantity: 8, source_location_id: 1, dest_location_id: 2, state: "done", origin: "Initial Stock", date: "2026-08-21" } }
];

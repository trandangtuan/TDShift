import type { ModelDefinition } from "@record-platform/core";

export const stockProductModel: ModelDefinition = {
  technicalName: "product.product",
  name: "Product",
  tableName: "product_product",
  fields: [
    { name: "qty_available", label: "On Hand", type: "decimal", readonly: true, stored: false, computeMethod: "compute_qty_available", sequence: 45 }
  ],
  methods: {
    async compute_qty_available(ctx) {
      const totals: Record<number, number> = {};
      for (const productId of ctx.ids) {
        const moves = await ctx.env.model("stock.move").searchRead([["product_id", "=", productId], ["state", "=", "done"]], ["quantity", "source_location_id", "dest_location_id"]);
        const locationIds = [...new Set(moves.flatMap((move) => [Number(move.source_location_id), Number(move.dest_location_id)]).filter((id) => Number.isFinite(id)))];
        const locations = await ctx.env.model("stock.location").read(locationIds, ["usage"]);
        const usageById = new Map(locations.map((location) => [Number(location.id), String(location.usage ?? "")]));
        totals[productId] = moves.reduce((sum, move) => {
          const quantity = Number(move.quantity ?? 0);
          const sourceUsage = usageById.get(Number(move.source_location_id));
          const destUsage = usageById.get(Number(move.dest_location_id));
          return sum + (destUsage === "internal" ? quantity : 0) - (sourceUsage === "internal" ? quantity : 0);
        }, 0);
      }
      return totals;
    }
  }
};

import type { ModelDefinition } from "@record-platform/core";

export const stockMoveModel: ModelDefinition = {
  technicalName: "stock.move",
  name: "Stock Move",
  tableName: "stock_move",
  fields: [
    { name: "name", label: "Reference", type: "char", required: true, sequence: 10 },
    { name: "product_id", label: "Product", type: "many2one", relationModel: "product.product", required: true, indexed: true, sequence: 20 },
    { name: "quantity", label: "Quantity", type: "decimal", defaultValue: 1, sequence: 30 },
    { name: "source_location_id", label: "Source Location", type: "many2one", relationModel: "stock.location", required: true, sequence: 40 },
    { name: "dest_location_id", label: "Destination Location", type: "many2one", relationModel: "stock.location", required: true, sequence: 50 },
    {
      name: "state",
      label: "State",
      type: "selection",
      defaultValue: "draft",
      selectionOptions: [
        { label: "Draft", value: "draft" },
        { label: "Done", value: "done" },
        { label: "Cancelled", value: "cancelled" }
      ],
      sequence: 60
    },
    { name: "origin", label: "Origin", type: "char", sequence: 70 },
    { name: "date", label: "Date", type: "date", sequence: 80 }
  ],
  methods: {
    async done(ctx) {
      await ctx.env.model("stock.move").write(ctx.ids, { state: "done" });
      return { done: ctx.ids.length };
    },
    async cancel(ctx) {
      await ctx.env.model("stock.move").write(ctx.ids, { state: "cancelled" });
      return { cancelled: ctx.ids.length };
    }
  }
};

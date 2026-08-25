import type { MethodContext, ModelDefinition } from "@record-platform/core";

export const purchaseOrderModel: ModelDefinition = {
  technicalName: "purchase.order",
  name: "Purchase Order",
  tableName: "purchase_order",
  fields: [
    { name: "name", label: "Order", type: "char", required: true, sequence: 10 },
    { name: "partner_id", label: "Vendor", type: "many2one", relationModel: "res.partner", required: true, sequence: 20 },
    { name: "date_order", label: "Order Date", type: "date", sequence: 30 },
    {
      name: "state",
      label: "State",
      type: "selection",
      defaultValue: "draft",
      selectionOptions: [
        { label: "Draft", value: "draft" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Cancelled", value: "cancelled" }
      ],
      sequence: 40
    },
    { name: "amount_total", label: "Total", type: "decimal", readonly: true, stored: false, computeMethod: "compute_amount_total", sequence: 50 },
    { name: "order_line", label: "Order Lines", type: "one2many", relationModel: "purchase.order.line", inverseField: "order_id", stored: false, sequence: 60 }
  ],
  methods: {
    async confirm(ctx) {
      const supplierLocation = await firstLocation(ctx, "supplier");
      const stockLocation = await firstLocation(ctx, "internal");
      for (const orderId of ctx.ids) {
        const [order] = await ctx.env.model("purchase.order").read([orderId], ["name", "date_order"]);
        const lines = await ctx.env.model("purchase.order.line").searchRead([["order_id", "=", orderId]], ["product_id", "quantity"]);
        for (const line of lines) {
          await ctx.env.model("stock.move").create({
            name: `${order?.name ?? "PO"} / Receipt / ${line.id}`,
            product_id: line.product_id,
            quantity: line.quantity,
            source_location_id: supplierLocation,
            dest_location_id: stockLocation,
            state: "draft",
            origin: order?.name,
            date: order?.date_order
          });
        }
      }
      await ctx.env.model("purchase.order").write(ctx.ids, { state: "confirmed" });
      return { confirmed: ctx.ids.length };
    },
    async cancel(ctx) {
      await ctx.env.model("purchase.order").write(ctx.ids, { state: "cancelled" });
      return { cancelled: ctx.ids.length };
    },
    async compute_amount_total(ctx) {
      const totals: Record<number, number> = {};
      for (const id of ctx.ids) {
        const lines = await ctx.env.model("purchase.order.line").searchRead([["order_id", "=", id]], ["price_subtotal"]);
        totals[id] = lines.reduce((sum, line) => sum + Number(line.price_subtotal ?? 0), 0);
      }
      return totals;
    }
  }
};

async function firstLocation(ctx: MethodContext, usage: string) {
  const locations = await ctx.env.model("stock.location").searchRead([["usage", "=", usage]], ["name"], { limit: 1 });
  if (!locations[0]?.id) throw new Error(`Missing stock location with usage ${usage}`);
  return Number(locations[0].id);
}

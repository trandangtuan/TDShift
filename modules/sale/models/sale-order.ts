import type { MethodContext, ModelDefinition } from "@record-platform/core";

export const saleOrderModel: ModelDefinition = {
  technicalName: "sale.order",
  name: "Sale Order",
  tableName: "sale_order",
  fields: [
    { name: "name", label: "Order", type: "char", required: true, sequence: 10 },
    { name: "partner_id", label: "Customer", type: "many2one", relationModel: "res.partner", required: true, sequence: 20 },
    { name: "date_order", label: "Order Date", type: "date", sequence: 40 },
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
      sequence: 50
    },
    { name: "amount_total", label: "Total", type: "decimal", readonly: true, computeMethod: "compute_amount_total", defaultValue: 0, sequence: 60 },
    { name: "order_line", label: "Order Lines", type: "one2many", relationModel: "sale.order.line", inverseField: "order_id", stored: false, sequence: 70 }
  ],
  methods: {
    async confirm(ctx) {
      const stockLocation = await firstLocation(ctx, "internal");
      const customerLocation = await firstLocation(ctx, "customer");
      for (const orderId of ctx.ids) {
        const [order] = await ctx.env.model("sale.order").read([orderId], ["name", "date_order"]);
        const lines = await ctx.env.model("sale.order.line").searchRead([["order_id", "=", orderId]], ["product_id", "quantity", "description"]);
        for (const line of lines) {
          await ctx.env.model("stock.move").create({
            name: `${order?.name ?? "SO"} / Delivery / ${line.id}`,
            product_id: line.product_id,
            quantity: line.quantity,
            source_location_id: stockLocation,
            dest_location_id: customerLocation,
            state: "draft",
            origin: order?.name,
            date: order?.date_order
          });
        }
      }
      await ctx.env.model("sale.order").write(ctx.ids, { state: "confirmed" });
      return { confirmed: ctx.ids.length };
    },
    async cancel(ctx) {
      await ctx.env.model("sale.order").write(ctx.ids, { state: "cancelled" });
      return { cancelled: ctx.ids.length };
    },
    async compute_amount_total(ctx) {
      const totals = Object.fromEntries(ctx.ids.map((id) => [id, 0])) as Record<number, number>;
      const lines = await ctx.env.withContext({ skipMany2OneEnrichment: true }).model("sale.order.line").searchRead([["order_id", "in", ctx.ids]], ["order_id", "price_subtotal"]);
      for (const line of lines) {
        const orderId = relationId(line.order_id);
        if (orderId === null) continue;
        totals[orderId] = (totals[orderId] ?? 0) + Number(line.price_subtotal ?? 0);
      }
      return totals;
    }
  }
};

function relationId(value: unknown) {
  if (Array.isArray(value)) {
    const id = Number(value[0]);
    return Number.isFinite(id) ? id : null;
  }
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

async function firstLocation(ctx: MethodContext, usage: string) {
  const locations = await ctx.env.model("stock.location").searchRead([["usage", "=", usage]], ["name"], { limit: 1 });
  if (!locations[0]?.id) throw new Error(`Missing stock location with usage ${usage}`);
  return Number(locations[0].id);
}

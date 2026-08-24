import type { ModelDefinition } from "@record-platform/core";

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
    { name: "amount_total", label: "Total", type: "decimal", readonly: true, stored: false, computeMethod: "compute_amount_total", sequence: 60 },
    { name: "order_line", label: "Order Lines", type: "one2many", relationModel: "sale.order.line", inverseField: "order_id", stored: false, sequence: 70 }
  ],
  methods: {
    async confirm(ctx) {
      await ctx.env.model("sale.order").write(ctx.ids, { state: "confirmed" });
      return { confirmed: ctx.ids.length };
    },
    async cancel(ctx) {
      await ctx.env.model("sale.order").write(ctx.ids, { state: "cancelled" });
      return { cancelled: ctx.ids.length };
    },
    async compute_amount_total(ctx) {
      const totals: Record<number, number> = {};
      for (const id of ctx.ids) {
        const lines = await ctx.env.model("sale.order.line").searchRead([["order_id", "=", id]], ["price_subtotal"]);
        totals[id] = lines.reduce((sum, line) => sum + Number(line.price_subtotal ?? 0), 0);
      }
      return totals;
    }
  }
};

import type { MethodContext, ModelDefinition } from "@record-platform/core";

export const saleOrderLineModel: ModelDefinition = {
  technicalName: "sale.order.line",
  name: "Đơn bán hàng Line",
  tableName: "sale_order_line",
  fields: [
    { name: "order_id", label: "Đơn hàng", type: "many2one", relationModel: "sale.order", required: true, indexed: true, sequence: 10 },
    { name: "product_id", label: "Sản phẩm", type: "many2one", relationModel: "product.product", required: true, sequence: 20 },
    { name: "description", label: "Mô tả", type: "char", sequence: 30 },
    { name: "quantity", label: "Số lượng", type: "decimal", defaultValue: 1, sequence: 40 },
    { name: "price_unit", label: "Đơn giá", type: "decimal", defaultValue: 0, sequence: 50 },
    { name: "price_subtotal", label: "Thành tiền", type: "decimal", defaultValue: 0, readonly: true, sequence: 60 }
  ],
  methods: {
    async after_create(ctx) {
      await recomputeOrderTotals(ctx, ctx.ids);
    },
    async after_write(ctx) {
      await recomputeOrderTotals(ctx, ctx.ids, previousRecords(ctx));
    },
    async after_unlink(ctx) {
      await recomputeOrderTotals(ctx, [], previousRecords(ctx));
    }
  }
};

async function recomputeOrderTotals(ctx: MethodContext, lineIds: number[], previous: Array<Record<string, unknown>> = []) {
  const orderIds = new Set<number>();
  for (const record of previous) addOrderId(orderIds, record.order_id);
  if (lineIds.length) {
    const lines = await ctx.env.withContext({ skipMany2OneEnrichment: true }).model("sale.order.line").read(lineIds, ["order_id"]);
    for (const line of lines) addOrderId(orderIds, line.order_id);
  }
  if (!orderIds.size) return;
  const ids = [...orderIds];
  const totals = await ctx.env.model("sale.order").call("compute_amount_total", ids, ["amount_total"]) as Record<string, unknown>;
  for (const id of ids) {
    await ctx.env.model("sale.order").write([id], { amount_total: Number(totals[id] ?? 0) });
  }
}

function previousRecords(ctx: MethodContext) {
  const [records] = ctx.args ?? [];
  return Array.isArray(records) ? records as Array<Record<string, unknown>> : [];
}

function addOrderId(orderIds: Set<number>, value: unknown) {
  const id = relationId(value);
  if (id !== null) orderIds.add(id);
}

function relationId(value: unknown) {
  if (Array.isArray(value)) {
    const id = Number(value[0]);
    return Number.isFinite(id) ? id : null;
  }
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

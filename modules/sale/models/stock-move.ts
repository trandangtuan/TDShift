import type { ModelDefinition } from "@record-platform/core";

export const saleStockMoveModel: ModelDefinition = {
  technicalName: "stock.move",
  name: "Stock Move",
  tableName: "stock_move",
  fields: [],
  extensions: [
    {
      model: "stock.move",
      method: "done",
      sequence: 100,
      async handler(ctx, next) {
        const result = await next?.();
        for (const id of ctx.ids) {
          const [move] = await ctx.env.model("stock.move").read([id], ["origin", "date", "source_location_id", "dest_location_id"]);
          if (!move?.origin || !(await isCustomerDelivery(ctx, move))) continue;
          await createCustomerInvoice(ctx, String(move.origin), String(move.date ?? ""));
        }
        return result;
      }
    }
  ]
};

async function isCustomerDelivery(ctx: { env: { model: (name: string) => any } }, move: Record<string, unknown>) {
  const sourceId = relationId(move.source_location_id);
  const destId = relationId(move.dest_location_id);
  if (!sourceId || !destId) return false;
  const [source] = await ctx.env.model("stock.location").read([sourceId], ["usage"]);
  const [dest] = await ctx.env.model("stock.location").read([destId], ["usage"]);
  return source?.usage === "internal" && dest?.usage === "customer";
}

async function createCustomerInvoice(ctx: { env: { model: (name: string) => any } }, saleName: string, deliveryDate: string) {
  const existing = await ctx.env.model("account.move").searchRead([["source_document", "=", saleName], ["move_type", "=", "out_invoice"]], ["name"], { limit: 1 });
  if (existing.length) return;

  const orders = await ctx.env.model("sale.order").searchRead([["name", "=", saleName]], ["partner_id", "date_order"], { limit: 1 });
  const order = orders[0];
  if (!order?.id) return;

  const saleJournalId = await firstRecord(ctx, "account.journal", [["type", "=", "sale"]]);
  const receivableAccountId = await firstRecord(ctx, "account.account", [["code", "=", "131"]]);
  const revenueAccountId = await firstRecord(ctx, "account.account", [["code", "=", "511"]]);
  const lines = await ctx.env.model("sale.order.line").searchRead([["order_id", "=", Number(order.id)]], ["description", "price_subtotal"]);
  const total = lines.reduce((sum: number, line: Record<string, unknown>) => sum + Number(line.price_subtotal ?? 0), 0);
  if (total <= 0) return;

  const invoiceDate = deliveryDate || String(order.date_order ?? "");
  const partnerId = relationId(order.partner_id);
  const invoiceId = await ctx.env.model("account.move").create({
    name: `INV/${saleName}`,
    date: invoiceDate,
    journal_id: saleJournalId,
    partner_id: partnerId,
    ref: saleName,
    source_document: saleName,
    move_type: "out_invoice",
    state: "draft"
  });
  await ctx.env.model("account.move.line").create({ move_id: invoiceId, account_id: receivableAccountId, partner_id: partnerId, name: `Receivable ${saleName}`, debit: total, credit: 0, date: invoiceDate });
  await ctx.env.model("account.move.line").create({ move_id: invoiceId, account_id: revenueAccountId, partner_id: partnerId, name: `Revenue ${saleName}`, debit: 0, credit: total, date: invoiceDate });
}

async function firstRecord(ctx: { env: { model: (name: string) => any } }, model: string, domain: any[]) {
  const records = await ctx.env.model(model).searchRead(domain, ["name"], { limit: 1 });
  if (!records[0]?.id) throw new Error(`Missing ${model} record for automated invoicing.`);
  return Number(records[0].id);
}

function relationId(value: unknown) {
  if (Array.isArray(value)) return Number(value[0]);
  return Number(value);
}

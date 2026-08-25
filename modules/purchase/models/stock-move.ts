import type { ModelDefinition } from "@record-platform/core";

export const purchaseStockMoveModel: ModelDefinition = {
  technicalName: "stock.move",
  name: "Stock Move",
  tableName: "stock_move",
  fields: [],
  extensions: [
    {
      model: "stock.move",
      method: "done",
      sequence: 110,
      async handler(ctx, next) {
        const result = await next?.();
        for (const id of ctx.ids) {
          const [move] = await ctx.env.model("stock.move").read([id], ["origin", "date", "source_location_id", "dest_location_id"]);
          if (!move?.origin || !(await isVendorReceipt(ctx, move))) continue;
          await createVendorBill(ctx, String(move.origin), String(move.date ?? ""));
        }
        return result;
      }
    }
  ]
};

async function isVendorReceipt(ctx: { env: { model: (name: string) => any } }, move: Record<string, unknown>) {
  const sourceId = relationId(move.source_location_id);
  const destId = relationId(move.dest_location_id);
  if (!sourceId || !destId) return false;
  const [source] = await ctx.env.model("stock.location").read([sourceId], ["usage"]);
  const [dest] = await ctx.env.model("stock.location").read([destId], ["usage"]);
  return source?.usage === "supplier" && dest?.usage === "internal";
}

async function createVendorBill(ctx: { env: { model: (name: string) => any } }, purchaseName: string, receiptDate: string) {
  const existing = await ctx.env.model("account.move").searchRead([["source_document", "=", purchaseName], ["move_type", "=", "in_invoice"]], ["name"], { limit: 1 });
  if (existing.length) return;

  const orders = await ctx.env.model("purchase.order").searchRead([["name", "=", purchaseName]], ["partner_id", "date_order"], { limit: 1 });
  const order = orders[0];
  if (!order?.id) return;

  const purchaseJournalId = await firstRecord(ctx, "account.journal", [["type", "=", "purchase"]]);
  const payableAccountId = await firstRecord(ctx, "account.account", [["code", "=", "331"]]);
  const purchaseAccountId = await firstRecord(ctx, "account.account", [["code", "=", "156"]]);
  const lines = await ctx.env.model("purchase.order.line").searchRead([["order_id", "=", Number(order.id)]], ["description", "price_subtotal"]);
  const total = lines.reduce((sum: number, line: Record<string, unknown>) => sum + Number(line.price_subtotal ?? 0), 0);
  if (total <= 0) return;

  const billDate = receiptDate || String(order.date_order ?? "");
  const partnerId = relationId(order.partner_id);
  const billId = await ctx.env.model("account.move").create({
    name: `BILL/${purchaseName}`,
    date: billDate,
    journal_id: purchaseJournalId,
    partner_id: partnerId,
    ref: purchaseName,
    source_document: purchaseName,
    move_type: "in_invoice",
    state: "draft"
  });
  await ctx.env.model("account.move.line").create({ move_id: billId, account_id: purchaseAccountId, partner_id: partnerId, name: `Inventory ${purchaseName}`, debit: total, credit: 0, date: billDate });
  await ctx.env.model("account.move.line").create({ move_id: billId, account_id: payableAccountId, partner_id: partnerId, name: `Payable ${purchaseName}`, debit: 0, credit: total, date: billDate });
}

async function firstRecord(ctx: { env: { model: (name: string) => any } }, model: string, domain: any[]) {
  const records = await ctx.env.model(model).searchRead(domain, ["name"], { limit: 1 });
  if (!records[0]?.id) throw new Error(`Missing ${model} record for automated vendor billing.`);
  return Number(records[0].id);
}

function relationId(value: unknown) {
  if (Array.isArray(value)) return Number(value[0]);
  return Number(value);
}

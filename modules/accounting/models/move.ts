import type { ModelDefinition } from "@record-platform/core";

export const accountMoveModel: ModelDefinition = {
  technicalName: "account.move",
  name: "Bút toán",
  tableName: "account_move",
  fields: [
    { name: "name", label: "Entry Number", type: "char", required: true, sequence: 10 },
    { name: "date", label: "Accounting Date", type: "date", required: true, sequence: 20 },
    { name: "journal_id", label: "Sổ nhật ký", type: "many2one", relationModel: "account.journal", required: true, sequence: 30 },
    { name: "partner_id", label: "Đối tác", type: "many2one", relationModel: "res.partner", sequence: 35 },
    { name: "ref", label: "Tham chiếu", type: "char", sequence: 40 },
    { name: "source_document", label: "Source Document", type: "char", indexed: true, sequence: 45 },
    {
      name: "move_type",
      label: "Move Type",
      type: "selection",
      defaultValue: "entry",
      selectionOptions: [
        { label: "Bút toán", value: "entry" },
        { label: "Customer Invoice", value: "out_invoice" },
        { label: "Provider Bill", value: "in_invoice" }
      ],
      sequence: 48
    },
    {
      name: "state",
      label: "Trạng thái",
      type: "selection",
      defaultValue: "draft",
      selectionOptions: [
        { label: "Nháp", value: "draft" },
        { label: "Đã ghi sổ", value: "posted" },
        { label: "Đã hủy", value: "cancelled" }
      ],
      sequence: 50
    },
    { name: "amount_debit", label: "Total Nợ", type: "decimal", readonly: true, stored: false, computeMethod: "compute_amount_debit", sequence: 60 },
    { name: "amount_credit", label: "Total Có", type: "decimal", readonly: true, stored: false, computeMethod: "compute_amount_credit", sequence: 70 },
    { name: "line_ids", label: "MoveLine", type: "one2many", relationModel: "account.move.line", inverseField: "move_id", stored: false, sequence: 80 }
  ],
  methods: {
    async post(ctx) {
      for (const id of ctx.ids) {
        const lines = await ctx.env.model("account.move.line").searchRead([["move_id", "=", id]], ["debit", "credit"]);
        if (lines.length < 2) throw new Error("A journal entry needs at least two journal items.");
        const totalNợ = sum(lines, "debit");
        const totalCó = sum(lines, "credit");
        if (totalNợ <= 0 || totalCó <= 0) throw new Error("Nợ and credit totals must be greater than zero.");
        if (Math.abs(totalNợ - totalCó) > 0.0001) throw new Error(`Journal entry is not balanced: debit ${totalNợ}, credit ${totalCó}.`);
      }
      await ctx.env.model("account.move").write(ctx.ids, { state: "posted" });
      return { posted: ctx.ids.length };
    },
    async cancel(ctx) {
      await ctx.env.model("account.move").write(ctx.ids, { state: "cancelled" });
      return { cancelled: ctx.ids.length };
    },
    async compute_amount_debit(ctx) {
      const totals: Record<number, number> = {};
      for (const id of ctx.ids) {
        totals[id] = sum(await ctx.env.model("account.move.line").searchRead([["move_id", "=", id]], ["debit"]), "debit");
      }
      return totals;
    },
    async compute_amount_credit(ctx) {
      const totals: Record<number, number> = {};
      for (const id of ctx.ids) {
        totals[id] = sum(await ctx.env.model("account.move.line").searchRead([["move_id", "=", id]], ["credit"]), "credit");
      }
      return totals;
    }
  }
};

function sum(lines: Array<Record<string, unknown>>, field: "debit" | "credit") {
  return lines.reduce((total, line) => total + Number(line[field] ?? 0), 0);
}

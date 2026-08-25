import type { ModelDefinition } from "@record-platform/core";

export const accountMoveModel: ModelDefinition = {
  technicalName: "account.move",
  name: "Journal Entry",
  tableName: "account_move",
  fields: [
    { name: "name", label: "Entry Number", type: "char", required: true, sequence: 10 },
    { name: "date", label: "Accounting Date", type: "date", required: true, sequence: 20 },
    { name: "journal_id", label: "Journal", type: "many2one", relationModel: "account.journal", required: true, sequence: 30 },
    { name: "partner_id", label: "Partner", type: "many2one", relationModel: "res.partner", sequence: 35 },
    { name: "ref", label: "Reference", type: "char", sequence: 40 },
    { name: "source_document", label: "Source Document", type: "char", indexed: true, sequence: 45 },
    {
      name: "move_type",
      label: "Move Type",
      type: "selection",
      defaultValue: "entry",
      selectionOptions: [
        { label: "Journal Entry", value: "entry" },
        { label: "Customer Invoice", value: "out_invoice" },
        { label: "Vendor Bill", value: "in_invoice" }
      ],
      sequence: 48
    },
    {
      name: "state",
      label: "State",
      type: "selection",
      defaultValue: "draft",
      selectionOptions: [
        { label: "Draft", value: "draft" },
        { label: "Posted", value: "posted" },
        { label: "Cancelled", value: "cancelled" }
      ],
      sequence: 50
    },
    { name: "amount_debit", label: "Total Debit", type: "decimal", readonly: true, stored: false, computeMethod: "compute_amount_debit", sequence: 60 },
    { name: "amount_credit", label: "Total Credit", type: "decimal", readonly: true, stored: false, computeMethod: "compute_amount_credit", sequence: 70 },
    { name: "line_ids", label: "Journal Items", type: "one2many", relationModel: "account.move.line", inverseField: "move_id", stored: false, sequence: 80 }
  ],
  methods: {
    async post(ctx) {
      for (const id of ctx.ids) {
        const lines = await ctx.env.model("account.move.line").searchRead([["move_id", "=", id]], ["debit", "credit"]);
        if (lines.length < 2) throw new Error("A journal entry needs at least two journal items.");
        const totalDebit = sum(lines, "debit");
        const totalCredit = sum(lines, "credit");
        if (totalDebit <= 0 || totalCredit <= 0) throw new Error("Debit and credit totals must be greater than zero.");
        if (Math.abs(totalDebit - totalCredit) > 0.0001) throw new Error(`Journal entry is not balanced: debit ${totalDebit}, credit ${totalCredit}.`);
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

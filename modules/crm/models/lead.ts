import type { MethodContext, ModelDefinition } from "@record-platform/core";

export const crmLeadModel: ModelDefinition = {
  technicalName: "crm.lead",
  name: "Lead / Cơ hội",
  tableName: "crm_lead",
  fields: [
    { name: "name", label: "Opportunity", type: "char", required: true, sequence: 10 },
    { name: "type", label: "Loại", type: "selection", defaultValue: "lead", selectionOptions: [{ label: "Lead", value: "lead" }, { label: "Opportunity", value: "opportunity" }], sequence: 20 },
    { name: "partner_id", label: "Khách hàng", type: "many2one", relationModel: "res.partner", sequence: 30 },
    { name: "contact_name", label: "Liên hệ Name", type: "char", sequence: 40 },
    { name: "email_from", label: "Email", type: "char", sequence: 50 },
    { name: "phone", label: "Điện thoại", type: "char", sequence: 60 },
    { name: "company_name", label: "Company", type: "char", sequence: 70 },
    { name: "team_id", label: "Bán hàng Team", type: "many2one", relationModel: "crm.team", sequence: 80 },
    { name: "user_id", label: "Bán hàngperson", type: "many2one", relationModel: "core.user", sequence: 90 },
    { name: "stage_id", label: "Stage", type: "many2one", relationModel: "crm.stage", sequence: 100 },
    { name: "tag_id", label: "Tag", type: "many2one", relationModel: "crm.tag", sequence: 110 },
    { name: "source_id", label: "Source", type: "many2one", relationModel: "crm.source", sequence: 120 },
    { name: "medium_id", label: "Medium", type: "many2one", relationModel: "crm.medium", sequence: 130 },
    { name: "campaign_id", label: "Campaign", type: "many2one", relationModel: "crm.campaign", sequence: 140 },
    { name: "expected_revenue", label: "Doanh thu dự kiến", type: "decimal", defaultValue: 0, sequence: 150 },
    { name: "probability", label: "Xác suất %", type: "decimal", defaultValue: 10, sequence: 160 },
    { name: "expected_closing", label: "Date chốt dự kiến", type: "date", sequence: 170 },
    { name: "priority", label: "Ưu tiên", type: "selection", defaultValue: "1", selectionOptions: [{ label: "Low", value: "0" }, { label: "Khôngrmal", value: "1" }, { label: "High", value: "2" }, { label: "Very High", value: "3" }], sequence: 180 },
    { name: "state", label: "Trạng thái", type: "selection", defaultValue: "new", selectionOptions: [{ label: "New", value: "new" }, { label: "Qualified", value: "qualified" }, { label: "Proposition", value: "proposition" }, { label: "Thắng", value: "won" }, { label: "Đã mất", value: "lost" }], sequence: 190 },
    { name: "lost_reason_id", label: "Lost Reason", type: "many2one", relationModel: "crm.lost.reason", sequence: 200 },
    { name: "lost_feedback", label: "Lost Feedback", type: "text", sequence: 210 },
    { name: "description", label: "Nội bộ Ghi chú", type: "text", sequence: 220 },
    { name: "activity_ids", label: "Activity", type: "one2many", relationModel: "crm.activity", inverseField: "lead_id", stored: false, sequence: 230 },
    { name: "quotation_count", label: "Quotations", type: "integer", readonly: true, stored: false, computeMethod: "compute_quotation_count", sequence: 240 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 250 }
  ],
  methods: {
    async convert(ctx) {
      const qualifiedStage = await firstStage(ctx, "open");
      await ctx.env.model("crm.lead").write(ctx.ids, { type: "opportunity", state: "qualified", stage_id: qualifiedStage, probability: 30 });
      return { converted: ctx.ids.length };
    },
    async won(ctx) {
      const wonStage = await firstStage(ctx, "won");
      await ctx.env.model("crm.lead").write(ctx.ids, { type: "opportunity", state: "won", stage_id: wonStage, probability: 100, lost_reason_id: null, lost_feedback: null });
      return { won: ctx.ids.length };
    },
    async lost(ctx) {
      const lostStage = await firstStage(ctx, "lost");
      await ctx.env.model("crm.lead").write(ctx.ids, { state: "lost", stage_id: lostStage, probability: 0 });
      return { lost: ctx.ids.length };
    },
    async restore(ctx) {
      const newStage = await firstStage(ctx, "new");
      await ctx.env.model("crm.lead").write(ctx.ids, { state: "new", stage_id: newStage, probability: 10, lost_reason_id: null, lost_feedback: null, active: true });
      return { restored: ctx.ids.length };
    },
    async create_quotation(ctx) {
      const created: number[] = [];
      for (const leadId of ctx.ids) {
        const [lead] = await ctx.env.model("crm.lead").read([leadId], ["name", "partner_id", "contact_name", "company_name", "email_from", "phone"]);
        if (!lead) continue;
        const partnerId = await ensurePartner(ctx, lead);
        const orderName = await nextSaleOrderName(ctx);
        const orderId = await ctx.env.model("sale.order").create({
          name: orderName,
          partner_id: partnerId,
          opportunity_id: leadId,
          date_order: today(),
          state: "draft"
        });
        await ctx.env.model("crm.activity").create({
          name: `Follow quotation ${orderName}`,
          lead_id: leadId,
          activity_type_id: await firstActivityType(ctx),
          assigned_user_id: ctx.env.user.id,
          deadline: addDays(2),
          state: "planned",
          note: `Quotation created from CRM opportunity ${lead.name ?? leadId}.`
        });
        await ctx.env.model("crm.lead").write([leadId], { type: "opportunity", state: "proposition", probability: 60 });
        created.push(orderId);
      }
      return { quotations: created };
    },
    async compute_quotation_count(ctx) {
      const totals: Record<number, number> = {};
      for (const id of ctx.ids) {
        const [lead] = await ctx.env.model("crm.lead").read([id], ["name"]);
        const orders = await ctx.env.model("sale.order").searchRead([["opportunity_id", "=", id]], ["name"]);
        totals[id] = orders.length;
      }
      return totals;
    }
  }
};

async function firstStage(ctx: MethodContext, stageType: string) {
  const stages = await ctx.env.model("crm.stage").searchRead([["stage_type", "=", stageType]], ["name"], { limit: 1 });
  return stages[0]?.id ? Number(stages[0].id) : null;
}

async function firstActivityType(ctx: MethodContext) {
  const types = await ctx.env.model("crm.activity.type").searchRead([], ["name"], { limit: 1 });
  if (!types[0]?.id) throw new Error("Missing CRM activity type");
  return Number(types[0].id);
}

async function ensurePartner(ctx: MethodContext, lead: Record<string, unknown>) {
  if (lead.partner_id) return Number(Array.isArray(lead.partner_id) ? lead.partner_id[0] : lead.partner_id);
  const name = String(lead.company_name || lead.contact_name || lead.name || "CRM Customer");
  return ctx.env.model("res.partner").create({
    name,
    email: lead.email_from ?? null,
    phone: lead.phone ?? null,
    active: true
  });
}

async function nextSaleOrderName(ctx: MethodContext) {
  const orders = await ctx.env.model("sale.order").searchRead([], ["name"], { limit: 1000 });
  const max = orders.reduce((current, order) => {
    const match = String(order.name ?? "").match(/^SO(\d+)$/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `SO${String(max + 1).padStart(4, "0")}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

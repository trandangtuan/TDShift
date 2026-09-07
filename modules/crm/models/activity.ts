import type { ModelDefinition } from "@record-platform/core";

export const crmActivityModel: ModelDefinition = {
  technicalName: "crm.activity",
  name: "Activity CRM",
  tableName: "crm_activity",
  fields: [
    { name: "name", label: "Summary", type: "char", required: true, sequence: 10 },
    { name: "lead_id", label: "Lead/Opportunity", type: "many2one", relationModel: "crm.lead", required: true, indexed: true, sequence: 20 },
    { name: "activity_type_id", label: "Activity Type", type: "many2one", relationModel: "crm.activity.type", required: true, sequence: 30 },
    { name: "assigned_user_id", label: "Assigned To", type: "many2one", relationModel: "core.user", sequence: 40 },
    { name: "deadline", label: "Deadline", type: "date", sequence: 50 },
    {
      name: "state",
      label: "Trạng thái",
      type: "selection",
      defaultValue: "planned",
      selectionOptions: [
        { label: "Planned", value: "planned" },
        { label: "Hoàn tất", value: "done" },
        { label: "Đã hủy", value: "cancelled" }
      ],
      sequence: 60
    },
    { name: "note", label: "Khôngte", type: "text", sequence: 70 },
    { name: "done_date", label: "Done Date", type: "date", sequence: 80 }
  ],
  methods: {
    async done(ctx) {
      await ctx.env.model("crm.activity").write(ctx.ids, { state: "done", done_date: today() });
      return { done: ctx.ids.length };
    },
    async cancel(ctx) {
      await ctx.env.model("crm.activity").write(ctx.ids, { state: "cancelled" });
      return { cancelled: ctx.ids.length };
    }
  }
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

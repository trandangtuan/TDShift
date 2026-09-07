import type { ModelDefinition } from "@record-platform/core";

export const stockMoveModel: ModelDefinition = {
  technicalName: "stock.move",
  name: "Dịch chuyển kho",
  tableName: "stock_move",
  fields: [
    { name: "name", label: "Tham chiếu", type: "char", required: true, sequence: 10 },
    { name: "product_id", label: "Sản phẩm", type: "many2one", relationModel: "product.product", required: true, indexed: true, sequence: 20 },
    { name: "quantity", label: "Số lượng", type: "decimal", defaultValue: 1, sequence: 30 },
    { name: "source_location_id", label: "Vị trí nguồn", type: "many2one", relationModel: "stock.location", required: true, sequence: 40 },
    { name: "dest_location_id", label: "Vị trí đích", type: "many2one", relationModel: "stock.location", required: true, sequence: 50 },
    {
      name: "state",
      label: "Trạng thái",
      type: "selection",
      defaultValue: "draft",
      selectionOptions: [
        { label: "Nháp", value: "draft" },
        { label: "Hoàn tất", value: "done" },
        { label: "Đã hủy", value: "cancelled" }
      ],
      sequence: 60
    },
    { name: "origin", label: "Nguồn gốc", type: "char", sequence: 70 },
    { name: "date", label: "Ngày", type: "date", sequence: 80 }
  ],
  methods: {
    async done(ctx) {
      await ctx.env.model("stock.move").write(ctx.ids, { state: "done" });
      return { done: ctx.ids.length };
    },
    async cancel(ctx) {
      await ctx.env.model("stock.move").write(ctx.ids, { state: "cancelled" });
      return { cancelled: ctx.ids.length };
    }
  }
};

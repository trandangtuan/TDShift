import type { ModelDefinition } from "@record-platform/core";

export const saleOrderDiscountModel: ModelDefinition = {
  technicalName: "sale.order",
  name: "Sale Order",
  tableName: "sale_order",
  fields: [
    { name: "discount_percent", label: "Discount %", type: "decimal", defaultValue: 0, sequence: 60 },
    { name: "discount_amount", label: "Discount Amount", type: "decimal", defaultValue: 0, readonly: true, sequence: 70 }
  ],
  extensions: [
    {
      model: "sale.order",
      method: "confirm",
      sequence: 100,
      async handler(ctx, next) {
        const records = await ctx.env.model("sale.order").read(ctx.ids, ["discount_percent"]);
        const invalid = records.find((record) => Number(record.discount_percent ?? 0) > 100);
        if (invalid) {
          throw new Error("Discount percent cannot be greater than 100.");
        }
        return next?.();
      }
    }
  ]
};

import type { ModelDefinition } from "@record-platform/core";

export const crmSaleOrderModel: ModelDefinition = {
  technicalName: "sale.order",
  name: "Đơn bán hàng",
  tableName: "sale_order",
  fields: [
    { name: "opportunity_id", label: "Opportunity", type: "many2one", relationModel: "crm.lead", indexed: true, sequence: 35 }
  ]
};

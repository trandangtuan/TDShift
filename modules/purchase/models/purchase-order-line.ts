import type { ModelDefinition } from "@record-platform/core";

export const purchaseOrderLineModel: ModelDefinition = {
  technicalName: "purchase.order.line",
  name: "Mua hàng Order Line",
  tableName: "purchase_order_line",
  fields: [
    { name: "order_id", label: "Đơn hàng", type: "many2one", relationModel: "purchase.order", required: true, indexed: true, sequence: 10 },
    { name: "product_id", label: "Sản phẩm", type: "many2one", relationModel: "product.product", required: true, sequence: 20 },
    { name: "description", label: "Mô tả", type: "char", sequence: 30 },
    { name: "quantity", label: "Số lượng", type: "decimal", defaultValue: 1, sequence: 40 },
    { name: "price_unit", label: "Đơn giá", type: "decimal", defaultValue: 0, sequence: 50 },
    { name: "price_subtotal", label: "Thành tiền", type: "decimal", defaultValue: 0, readonly: true, sequence: 60 }
  ]
};

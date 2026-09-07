import { defineModule } from "@record-platform/core";
import { purchaseOrderData, purchaseorderLineData } from "./data";
import { purchaseOrderLineModel, purchaseOrderModel, purchaseStockMoveModel } from "./models";
import { purchaseorderLineView, purchaseOrderView } from "./views";

export default defineModule({
  technicalName: "purchase",
  displayName: "Mua hàng",
  version: "1.1.0",
  depends: ["base", "contacts", "product", "stock", "accounting"],
  sequence: 25,
  models: [purchaseOrderModel, purchaseOrderLineModel, purchaseStockMoveModel],
  views: [...purchaseOrderView, ...purchaseorderLineView],
  actions: [
    { technicalName: "purchase.action_orders", name: "Mua hàng Order", type: "window", model: "purchase.order", viewModes: ["list", "form"] },
    { technicalName: "purchase.action_order_lines", name: "Mua hàng Dòng đơn hàng", type: "window", model: "purchase.order.line", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "purchase.menu_root", name: "Mua hàng", icon: "shopping-cart", sequence: 25 },
    { technicalName: "purchase.menu_orders", name: "Đơn hàng", parent: "purchase.menu_root", action: "purchase.action_orders", sequence: 10 }
  ],
  data: [...purchaseOrderData, ...purchaseorderLineData]
});

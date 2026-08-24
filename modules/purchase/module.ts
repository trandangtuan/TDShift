import { defineModule } from "@record-platform/core";
import { purchaseOrderData, purchaseOrderLineData } from "./data";
import { purchaseOrderLineModel, purchaseOrderModel } from "./models";
import { purchaseOrderLineViews, purchaseOrderViews } from "./views";

export default defineModule({
  technicalName: "purchase",
  displayName: "Purchases",
  version: "1.0.0",
  depends: ["base", "contacts", "product", "stock"],
  sequence: 25,
  models: [purchaseOrderModel, purchaseOrderLineModel],
  views: [...purchaseOrderViews, ...purchaseOrderLineViews],
  actions: [
    { technicalName: "purchase.action_orders", name: "Purchase Orders", type: "window", model: "purchase.order", viewModes: ["list", "form"] },
    { technicalName: "purchase.action_order_lines", name: "Purchase Order Lines", type: "window", model: "purchase.order.line", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "purchase.menu_root", name: "Purchases", icon: "shopping-cart", sequence: 25 },
    { technicalName: "purchase.menu_orders", name: "Orders", parent: "purchase.menu_root", action: "purchase.action_orders", sequence: 10 }
  ],
  data: [...purchaseOrderData, ...purchaseOrderLineData]
});

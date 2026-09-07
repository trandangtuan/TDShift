import { defineModule } from "@record-platform/core";
import { orderData, orderLineData } from "./data";
import { saleOrderLineModel, saleOrderModel, saleStockMoveModel } from "./models";
import { saleorderLineView, saleOrderView } from "./views";

export default defineModule({
  technicalName: "sale",
  displayName: "Bán hàng",
  version: "1.1.0",
  depends: ["base", "contacts", "product", "stock", "accounting"],
  sequence: 20,
  models: [saleOrderModel, saleOrderLineModel, saleStockMoveModel],
  views: [...saleOrderView, ...saleorderLineView],
  actions: [
    { technicalName: "sale.action_orders", name: "Đơn hàng", type: "window", model: "sale.order", viewModes: ["list", "form"] },
    { technicalName: "sale.action_order_lines", name: "Dòng đơn hàng", type: "window", model: "sale.order.line", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "sale.menu_root", name: "Bán hàng", icon: "shopping-cart", sequence: 10 },
    { technicalName: "sale.menu_orders", name: "Đơn hàng", parent: "sale.menu_root", action: "sale.action_orders", sequence: 10 }
  ],
  data: [...orderData, ...orderLineData]
});

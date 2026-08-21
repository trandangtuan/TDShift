import { defineModule } from "@record-platform/core";
import { orderData, orderLineData, productData } from "./data";
import { productModel, saleOrderLineModel, saleOrderModel } from "./models";
import { productViews, saleOrderLineViews, saleOrderViews } from "./views";

export default defineModule({
  technicalName: "sale",
  displayName: "Sales",
  version: "1.0.0",
  depends: ["base", "contacts"],
  sequence: 20,
  models: [productModel, saleOrderModel, saleOrderLineModel],
  views: [...productViews, ...saleOrderViews, ...saleOrderLineViews],
  actions: [
    { technicalName: "sale.action_orders", name: "Orders", type: "window", model: "sale.order", viewModes: ["list", "form"] },
    { technicalName: "sale.action_products", name: "Products", type: "window", model: "product.product", viewModes: ["list", "form"] },
    { technicalName: "sale.action_order_lines", name: "Order Lines", type: "window", model: "sale.order.line", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "sale.menu_root", name: "Sales", icon: "shopping-cart", sequence: 10 },
    { technicalName: "sale.menu_orders", name: "Orders", parent: "sale.menu_root", action: "sale.action_orders", sequence: 10 },
    { technicalName: "sale.menu_order_lines", name: "Order Lines", parent: "sale.menu_root", action: "sale.action_order_lines", sequence: 20 },
    { technicalName: "sale.menu_products", name: "Products", parent: "sale.menu_root", action: "sale.action_products", sequence: 30 }
  ],
  data: [...productData, ...orderData, ...orderLineData]
});

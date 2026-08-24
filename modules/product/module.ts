import { defineModule } from "@record-platform/core";
import { productData } from "./data";
import { productModel } from "./models";
import { productViews } from "./views";

export default defineModule({
  technicalName: "product",
  displayName: "Products",
  version: "1.0.0",
  description: "Shared product master data for sales, purchases, and inventory.",
  depends: ["base"],
  sequence: 15,
  models: [productModel],
  views: productViews,
  actions: [
    { technicalName: "product.action_products", name: "Products", type: "window", model: "product.product", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "product.menu_root", name: "Products", icon: "package", sequence: 15 },
    { technicalName: "product.menu_products", name: "Products", parent: "product.menu_root", action: "product.action_products", sequence: 10 }
  ],
  data: productData
});

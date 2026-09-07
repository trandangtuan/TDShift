import { defineModule } from "@record-platform/core";
import { productData } from "./data";
import { productModel } from "./models";
import { productView } from "./views";

export default defineModule({
  technicalName: "product",
  displayName: "Sản phẩm",
  version: "1.0.0",
  description: "Shared product master data for sales, purchases, and inventory.",
  depends: ["base"],
  sequence: 15,
  models: [productModel],
  views: productView,
  actions: [
    { technicalName: "product.action_products", name: "Sản phẩm", type: "window", model: "product.product", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "product.menu_root", name: "Sản phẩm", icon: "package", sequence: 15 },
    { technicalName: "product.menu_products", name: "Sản phẩm", parent: "product.menu_root", action: "product.action_products", sequence: 10 }
  ],
  data: productData
});

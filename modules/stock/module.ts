import { defineModule } from "@record-platform/core";
import { stockLocationData, stockMoveData } from "./data";
import { stockLocationModel, stockMoveModel, stockProductModel } from "./models";
import { stockLocationView, stockMoveView, stockProductViewExtensions } from "./views";

export default defineModule({
  technicalName: "stock",
  displayName: "Stock",
  version: "1.0.0",
  depends: ["base", "product"],
  sequence: 30,
  models: [stockLocationModel, stockMoveModel, stockProductModel],
  views: [...stockLocationView, ...stockMoveView],
  viewExtensions: stockProductViewExtensions,
  actions: [
    { technicalName: "stock.action_moves", name: "Dịch chuyển kho", type: "window", model: "stock.move", viewModes: ["list", "form"] },
    { technicalName: "stock.action_locations", name: "Location kho", type: "window", model: "stock.location", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "stock.menu_root", name: "Stock", icon: "package", sequence: 30 },
    { technicalName: "stock.menu_moves", name: "Dịch chuyển kho", parent: "stock.menu_root", action: "stock.action_moves", sequence: 10 },
    { technicalName: "stock.menu_locations", name: "Location kho", parent: "stock.menu_root", action: "stock.action_locations", sequence: 20 }
  ],
  data: [...stockLocationData, ...stockMoveData]
});

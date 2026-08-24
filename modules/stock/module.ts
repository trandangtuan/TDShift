import { defineModule } from "@record-platform/core";
import { stockLocationData, stockMoveData } from "./data";
import { stockLocationModel, stockMoveModel, stockProductModel } from "./models";
import { stockLocationViews, stockMoveViews, stockProductViewExtensions } from "./views";

export default defineModule({
  technicalName: "stock",
  displayName: "Inventory",
  version: "1.0.0",
  depends: ["base", "product"],
  sequence: 30,
  models: [stockLocationModel, stockMoveModel, stockProductModel],
  views: [...stockLocationViews, ...stockMoveViews],
  viewExtensions: stockProductViewExtensions,
  actions: [
    { technicalName: "stock.action_moves", name: "Stock Moves", type: "window", model: "stock.move", viewModes: ["list", "form"] },
    { technicalName: "stock.action_locations", name: "Locations", type: "window", model: "stock.location", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "stock.menu_root", name: "Inventory", icon: "package", sequence: 30 },
    { technicalName: "stock.menu_moves", name: "Stock Moves", parent: "stock.menu_root", action: "stock.action_moves", sequence: 10 },
    { technicalName: "stock.menu_locations", name: "Locations", parent: "stock.menu_root", action: "stock.action_locations", sequence: 20 }
  ],
  data: [...stockLocationData, ...stockMoveData]
});

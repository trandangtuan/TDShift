import { defineModule } from "@record-platform/core";
import { pageData, websiteMenuData } from "./data";
import { pageModel, websiteMenuModel } from "./models";
import { websiteRoutes } from "./routes";
import { pageViews, websiteMenuViews } from "./views";

export default defineModule({
  technicalName: "website",
  displayName: "Website",
  version: "1.0.0",
  depends: ["base"],
  sequence: 35,
  models: [pageModel, websiteMenuModel],
  views: [...pageViews, ...websiteMenuViews],
  actions: [
    {
      technicalName: "website.action_pages",
      name: "Pages",
      type: "window",
      model: "website.page",
      viewModes: ["list", "form"]
    },
    {
      technicalName: "website.action_menus",
      name: "Website Menus",
      type: "window",
      model: "website.menu",
      viewModes: ["list", "form"]
    }
  ],
  menus: [
    { technicalName: "website.menu_root", name: "Website", icon: "globe", sequence: 35 },
    { technicalName: "website.menu_pages", name: "Pages", parent: "website.menu_root", action: "website.action_pages", sequence: 10 },
    { technicalName: "website.menu_menus", name: "Menus", parent: "website.menu_root", action: "website.action_menus", sequence: 20 }
  ],
  data: [...pageData, ...websiteMenuData],
  routes: websiteRoutes
});

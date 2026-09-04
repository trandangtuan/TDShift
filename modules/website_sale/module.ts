import { defineModule } from "@record-platform/core";
import { websiteSaleData } from "./data";
import { websiteSaleRoutes } from "./routes";
import { websiteSaleViews } from "./views";

export default defineModule({
  technicalName: "website_sale",
  displayName: "Website Products",
  version: "1.0.0",
  description: "Publishes active products through the public website.",
  depends: ["website", "product"],
  sequence: 36,
  views: websiteSaleViews,
  data: websiteSaleData,
  routes: websiteSaleRoutes
});

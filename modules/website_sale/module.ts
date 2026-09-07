import { defineModule } from "@record-platform/core";
import { websiteSaleData } from "./data";
import { websiteSaleRoutes } from "./routes";
import { websiteSaleView } from "./views";

export default defineModule({
  technicalName: "website_sale",
  displayName: "Website Product",
  version: "1.0.0",
  description: "Xuất bản sản phẩm đang hoạt động lên website công khai.",
  depends: ["website", "product"],
  sequence: 36,
  views: websiteSaleView,
  data: websiteSaleData,
  routes: websiteSaleRoutes
});

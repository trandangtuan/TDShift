import { defineModule } from "@record-platform/core";
import { saleOrderDiscountModel } from "./models";
import { saleOrderDiscountViewExtensions } from "./views";

export default defineModule({
  technicalName: "sale_discount",
  displayName: "Bán hàng Discount",
  version: "1.0.0",
  depends: ["sale"],
  sequence: 30,
  models: [saleOrderDiscountModel],
  viewExtensions: saleOrderDiscountViewExtensions
});

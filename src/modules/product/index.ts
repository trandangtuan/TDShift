import type { ModulePlugin } from "../../core/types";
import { ProductCategory, ProductProduct, ProductTag, ProductTemplate } from "./models";

export const productModule: ModulePlugin = {
  manifest: {
    name: "product",
    displayName: "Sản phẩm",
    version: "1.2.0",
    summary: "Quản lý mẫu sản phẩm, biến thể, danh mục và thẻ",
    depends: ["base"],
    autoInstall: true,
  },
  models: [ProductCategory, ProductTag, ProductTemplate, ProductProduct],
  menus: [
    { id: "product.menu_root", name: "Sản phẩm", sequence: 10, icon: "cube-outline" },
    { id: "product.menu_catalog", name: "Danh mục sản phẩm", parentId: "product.menu_root", sequence: 10 },
    { id: "product.menu_templates", name: "Mẫu sản phẩm", parentId: "product.menu_catalog", sequence: 10, modelName: "product.template" },
    { id: "product.menu_variants", name: "Biến thể sản phẩm", parentId: "product.menu_catalog", sequence: 20, modelName: "product.product" },
    { id: "product.menu_configuration", name: "Cấu hình", parentId: "product.menu_root", sequence: 20 },
    { id: "product.menu_categories", name: "Danh mục", parentId: "product.menu_configuration", sequence: 10, modelName: "product.category" },
    { id: "product.menu_tags", name: "Thẻ sản phẩm", parentId: "product.menu_configuration", sequence: 20, modelName: "product.tag" },
  ],
  views: {
    "product.category": {
      list: { type: "list", title: "Danh mục", fields: ["name", "active"] },
      form: { type: "form", title: "Danh mục", fields: ["name", "parent_id", "active"] },
    },
    "product.tag": {
      list: { type: "list", title: "Thẻ sản phẩm", fields: ["name", "active"] },
      form: { type: "form", title: "Thẻ sản phẩm", fields: ["name", "active"] },
    },
    "product.template": {
      list: { type: "list", title: "Mẫu sản phẩm", fields: ["name", "list_price", "standard_price", "active"] },
      form: { type: "form", title: "Mẫu sản phẩm", fields: ["name", "image_1920", "description", "sequence", "list_price", "standard_price", "available_date", "categ_id", "tag_ids", "product_variant_ids", "active"] },
    },
    "product.product": {
      list: { type: "list", title: "Biến thể", fields: ["name", "default_code", "barcode", "active"] },
      form: { type: "form", title: "Biến thể", fields: ["name", "product_tmpl_id", "default_code", "barcode", "extra_price", "active"] },
    },
  },
  async seed(env) {
    const categories = env.model("product.category");
    const categoryModel = env.model("product.category");
    const tagModel = env.model("product.tag");
    const templateModel = env.model("product.template");
    const variantModel = env.model("product.product");
    const existingOffice = (await categories.searchRead({ where: { name: "Nội thất văn phòng" }, limit: 1 }))[0];
    const office = existingOffice ?? await categoryModel.create({ name: "Nội thất văn phòng", active: true });
    const existingTag = (await tagModel.searchRead({ where: { name: "Bán chạy" }, limit: 1 }))[0];
    const tag = existingTag ?? await tagModel.create({ name: "Bán chạy", active: true });
    const today = new Date().toISOString().slice(0, 10);
    const samples = [
      { name: "Bàn làm việc Custom", variant: "Bàn Custom / Gỗ sồi", code: "DESK-OAK", barcode: "893000000001", price: 4500000, cost: 3100000 },
      { name: "Ghế công thái học Pro", variant: "Ghế công thái học Pro / Đen", code: "CHAIR-PRO-BLK", barcode: "893000000002", price: 3200000, cost: 2100000 },
      { name: "Tủ hồ sơ 3 ngăn", variant: "Tủ hồ sơ 3 ngăn / Trắng", code: "CABINET-3-WHT", barcode: "893000000003", price: 2850000, cost: 1900000 },
      { name: "Đèn bàn LED cảm ứng", variant: "Đèn bàn LED / Trắng", code: "LAMP-LED-WHT", barcode: "893000000004", price: 650000, cost: 390000 },
      { name: "Kệ sách 5 tầng", variant: "Kệ sách 5 tầng / Gỗ", code: "SHELF-5-OAK", barcode: "893000000005", price: 1750000, cost: 1150000 },
      { name: "Bàn họp 6 người", variant: "Bàn họp 6 người / Nâu", code: "MEET-6-BRN", barcode: "893000000006", price: 6800000, cost: 4700000 },
      { name: "Ghế xoay văn phòng", variant: "Ghế xoay văn phòng / Xám", code: "CHAIR-OFF-GRY", barcode: "893000000007", price: 1450000, cost: 920000 },
      { name: "Hộc tủ di động", variant: "Hộc tủ di động / Đen", code: "DRAWER-M-BLK", barcode: "893000000008", price: 1250000, cost: 780000 },
      { name: "Bảng viết từ tính", variant: "Bảng viết từ tính / 120x80", code: "BOARD-12080", barcode: "893000000009", price: 980000, cost: 610000 },
      { name: "Giá đỡ màn hình", variant: "Giá đỡ màn hình / Đôi", code: "MONITOR-DUAL", barcode: "893000000010", price: 1150000, cost: 720000 },
      { name: "Vách ngăn bàn làm việc", variant: "Vách ngăn bàn / Xanh", code: "DIVIDER-BLU", barcode: "893000000011", price: 520000, cost: 310000 },
    ];

    for (const [index, sample] of samples.entries()) {
      if ((await variantModel.searchRead({ where: { default_code: sample.code }, limit: 1 })).length) continue;
      const template = await templateModel.create({
        name: sample.name,
        description: "Sản phẩm mẫu dùng thử cho bán hàng POS.",
        sequence: (index + 1) * 10,
        list_price: sample.price,
        standard_price: sample.cost,
        available_date: today,
        categ_id: office.id,
        tag_ids: [tag.id],
        active: true,
      });
      await variantModel.create({
        name: sample.variant,
        product_tmpl_id: template.id,
        default_code: sample.code,
        barcode: sample.barcode,
        extra_price: 0,
        active: true,
      });
    }
  },
};

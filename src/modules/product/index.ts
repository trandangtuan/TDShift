import type { ModulePlugin } from "../../core/types";
import { ProductCategory, ProductProduct, ProductTag, ProductTemplate } from "./models";

export const productModule: ModulePlugin = {
  manifest: {
    name: "product",
    displayName: "Sản phẩm",
    version: "1.0.0",
    summary: "Quản lý mẫu sản phẩm, biến thể, danh mục và thẻ",
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
      form: { type: "form", title: "Mẫu sản phẩm", fields: ["name", "description", "sequence", "list_price", "standard_price", "available_date", "categ_id", "tag_ids", "product_variant_ids", "active"] },
    },
    "product.product": {
      list: { type: "list", title: "Biến thể", fields: ["name", "default_code", "barcode", "active"] },
      form: { type: "form", title: "Biến thể", fields: ["name", "product_tmpl_id", "default_code", "barcode", "extra_price", "active"] },
    },
  },
  async seed(env) {
    const categories = env.model("product.category");
    if ((await categories.searchRead({ limit: 1 })).length) return;
    const office = await categories.create({ name: "Nội thất văn phòng", active: true });
    const tag = await env.model("product.tag").create({ name: "Bán chạy", active: true });
    const template = await env.model("product.template").create({
      name: "Bàn làm việc Custom",
      description: "Sản phẩm mẫu được tạo bởi module Product.",
      sequence: 10,
      list_price: 4500000,
      standard_price: 3100000,
      available_date: new Date().toISOString().slice(0, 10),
      categ_id: office.id,
      tag_ids: [tag.id],
      active: true,
    });
    await env.model("product.product").create({
      name: "Bàn Custom / Gỗ sồi",
      product_tmpl_id: template.id,
      default_code: "DESK-OAK",
      barcode: "893000000001",
      extra_price: 0,
      active: true,
    });
  },
};

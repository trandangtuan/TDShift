import { fields, type FieldMap } from "../../core/fields";
import { Model } from "../../core/Model";

export class ProductBase extends Model {
  static override fields: FieldMap = {
    active: fields.Boolean({ string: "Hoạt động", default: true, index: true }),
  };
}

export class ProductCategory extends ProductBase {
  static override modelName = "product.category";
  static override description = "Danh mục sản phẩm";
  static override tableName = "product_category";
  static override fields = {
    name: fields.Char({ string: "Tên danh mục", required: true, index: true }),
    parent_id: fields.Many2one("product.category", { string: "Danh mục cha" }),
  };
}

export class ProductTag extends ProductBase {
  static override modelName = "product.tag";
  static override description = "Thẻ sản phẩm";
  static override tableName = "product_tag";
  static override fields = {
    name: fields.Char({ string: "Tên thẻ", required: true, index: true }),
  };
}

export class ProductTemplate extends ProductBase {
  static override modelName = "product.template";
  static override description = "Mẫu sản phẩm";
  static override tableName = "product_template";
  static override modelVersion = 1;
  static override fields = {
    name: fields.Char({ string: "Tên sản phẩm", required: true, index: true }),
    description: fields.Text({ string: "Mô tả" }),
    sequence: fields.Integer({ string: "Thứ tự", default: 10 }),
    list_price: fields.Float({ string: "Giá bán", default: 0 }),
    standard_price: fields.Float({ string: "Giá vốn", default: 0 }),
    available_date: fields.Date({ string: "Ngày khả dụng" }),
    categ_id: fields.Many2one("product.category", { string: "Danh mục" }),
    tag_ids: fields.Many2many("product.tag", { string: "Thẻ", relation: "product_template_tag_rel" }),
    product_variant_ids: fields.One2many("product.product", "product_tmpl_id", { string: "Biến thể", readonly: true }),
  };
}

export class ProductProduct extends ProductBase {
  static override modelName = "product.product";
  static override description = "Biến thể sản phẩm";
  static override tableName = "product_product";
  static override fields = {
    name: fields.Char({ string: "Tên biến thể", required: true, index: true }),
    product_tmpl_id: fields.Many2one("product.template", { string: "Mẫu sản phẩm", required: true, index: true }),
    default_code: fields.Char({ string: "Mã nội bộ", index: true }),
    barcode: fields.Char({ string: "Mã vạch", index: true }),
    extra_price: fields.Float({ string: "Giá cộng thêm", default: 0 }),
  };
}

import { fields, type FieldMap } from "../../core/fields";
import { Model } from "../../core/Model";

const locationUsage = [
  ["internal", "Vị trí nội bộ"], ["view", "Vị trí xem"], ["customer", "Khách hàng"],
  ["supplier", "Nhà cung cấp"], ["inventory", "Điều chỉnh tồn"], ["transit", "Trung chuyển"],
] as const;

const pickingCode = [["incoming", "Nhập kho"], ["outgoing", "Xuất kho"], ["internal", "Điều chuyển nội bộ"]] as const;
const pickingState = [
  ["draft", "Nháp"], ["waiting", "Đang chờ"], ["confirmed", "Đang chờ hàng"],
  ["assigned", "Sẵn sàng"], ["done", "Hoàn tất"], ["cancel", "Đã hủy"],
] as const;

export class StockBase extends Model {
  static override fields: FieldMap = {
    active: fields.Boolean({ string: "Hoạt động", default: true, index: true }),
  };
}

export class StockLocation extends StockBase {
  static override modelName = "stock.location";
  static override description = "Vị trí kho";
  static override tableName = "stock_location";
  static override fields = {
    name: fields.Char({ string: "Tên vị trí", required: true, index: true }),
    complete_name: fields.Char({ string: "Tên đầy đủ", required: true, index: true }),
    usage: fields.Selection(locationUsage, { string: "Loại vị trí", required: true, default: "internal", index: true }),
    location_id: fields.Many2one("stock.location", { string: "Vị trí cha", index: true }),
    warehouse_id: fields.Many2one("stock.warehouse", { string: "Kho", index: true }),
    barcode: fields.Char({ string: "Mã vạch", index: true }),
  };
}

export class StockWarehouse extends StockBase {
  static override modelName = "stock.warehouse";
  static override description = "Kho hàng";
  static override tableName = "stock_warehouse";
  static override fields = {
    name: fields.Char({ string: "Tên kho", required: true, index: true }),
    code: fields.Char({ string: "Mã kho", required: true, index: true, size: 5 }),
    lot_stock_id: fields.Many2one("stock.location", { string: "Vị trí tồn chính", required: true }),
  };
}

export class StockPickingType extends StockBase {
  static override modelName = "stock.picking.type";
  static override description = "Loại hoạt động";
  static override tableName = "stock_picking_type";
  static override fields = {
    name: fields.Char({ string: "Tên hoạt động", required: true, index: true }),
    sequence_code: fields.Char({ string: "Mã trình tự", required: true }),
    code: fields.Selection(pickingCode, { string: "Loại", required: true, index: true }),
    warehouse_id: fields.Many2one("stock.warehouse", { string: "Kho", required: true, index: true }),
    default_location_src_id: fields.Many2one("stock.location", { string: "Vị trí nguồn mặc định" }),
    default_location_dest_id: fields.Many2one("stock.location", { string: "Vị trí đích mặc định" }),
  };
}

export class StockPicking extends StockBase {
  static override modelName = "stock.picking";
  static override description = "Phiếu kho";
  static override tableName = "stock_picking";
  static override fields = {
    name: fields.Char({ string: "Mã phiếu", required: true, index: true }),
    origin: fields.Char({ string: "Chứng từ nguồn", index: true }),
    picking_type_id: fields.Many2one("stock.picking.type", { string: "Loại hoạt động", required: true, index: true }),
    location_id: fields.Many2one("stock.location", { string: "Vị trí nguồn", required: true, index: true }),
    location_dest_id: fields.Many2one("stock.location", { string: "Vị trí đích", required: true, index: true }),
    scheduled_date: fields.Datetime({ string: "Ngày dự kiến", required: true, default: () => new Date().toISOString() }),
    date_done: fields.Datetime({ string: "Ngày hoàn tất" }),
    state: fields.Selection(pickingState, { string: "Trạng thái", required: true, default: "draft", index: true }),
    priority: fields.Selection([["0", "Bình thường"], ["1", "Khẩn cấp"]], { string: "Ưu tiên", default: "0" }),
    move_ids: fields.One2many("stock.move", "picking_id", { string: "Dịch chuyển", readonly: true }),
    note: fields.Text({ string: "Ghi chú" }),
  };
}

export class StockMove extends StockBase {
  static override modelName = "stock.move";
  static override description = "Dịch chuyển kho";
  static override tableName = "stock_move";
  static override fields = {
    name: fields.Char({ string: "Mô tả", required: true, index: true }),
    picking_id: fields.Many2one("stock.picking", { string: "Phiếu kho", index: true }),
    product_id: fields.Many2one("product.product", { string: "Sản phẩm", required: true, index: true }),
    product_uom_qty: fields.Float({ string: "Nhu cầu", required: true, default: 1 }),
    quantity: fields.Float({ string: "Số lượng thực hiện", default: 0 }),
    location_id: fields.Many2one("stock.location", { string: "Từ", required: true, index: true }),
    location_dest_id: fields.Many2one("stock.location", { string: "Đến", required: true, index: true }),
    state: fields.Selection(pickingState, { string: "Trạng thái", required: true, default: "draft", index: true }),
    date: fields.Datetime({ string: "Ngày", default: () => new Date().toISOString() }),
  };
}

export class StockQuant extends StockBase {
  static override modelName = "stock.quant";
  static override description = "Tồn kho theo vị trí";
  static override tableName = "stock_quant";
  static override fields = {
    name: fields.Char({ string: "Tham chiếu", required: true, index: true }),
    product_id: fields.Many2one("product.product", { string: "Sản phẩm", required: true, index: true }),
    location_id: fields.Many2one("stock.location", { string: "Vị trí", required: true, index: true }),
    quantity: fields.Float({ string: "Số lượng tồn", default: 0 }),
    reserved_quantity: fields.Float({ string: "Đã giữ", default: 0 }),
    inventory_quantity: fields.Float({ string: "Số lượng kiểm kê", default: 0 }),
    inventory_date: fields.Date({ string: "Ngày kiểm kê" }),
  };
}

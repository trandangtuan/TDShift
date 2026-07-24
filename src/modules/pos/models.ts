import { fields, type FieldMap } from "../../core/fields";
import { Model } from "../../core/Model";

const sessionState = [["opening_control", "Mở ca"], ["opened", "Đang bán"], ["closing_control", "Đóng ca"], ["closed", "Đã đóng"]] as const;
const orderState = [["draft", "Đơn nháp"], ["paid", "Đã thanh toán"], ["done", "Hoàn tất"], ["invoiced", "Đã xuất hóa đơn"], ["cancel", "Đã hủy"]] as const;

export class PosBase extends Model {
  static override fields: FieldMap = {
    active: fields.Boolean({ string: "Hoạt động", default: true, index: true }),
  };
}

export class PosPaymentMethod extends PosBase {
  static override modelName = "pos.payment.method";
  static override description = "Phương thức thanh toán POS";
  static override tableName = "pos_payment_method";
  static override fields = {
    name: fields.Char({ string: "Tên phương thức", required: true, index: true }),
    is_cash_count: fields.Boolean({ string: "Theo dõi tiền mặt", default: false }),
    split_transactions: fields.Boolean({ string: "Tách giao dịch", default: false }),
    sequence: fields.Integer({ string: "Thứ tự", default: 10 }),
  };
}

export class PosConfig extends PosBase {
  static override modelName = "pos.config";
  static override description = "Điểm bán hàng";
  static override tableName = "pos_config";
  static override fields = {
    name: fields.Char({ string: "Tên điểm bán", required: true, index: true }),
    picking_type_id: fields.Many2one("stock.picking.type", { string: "Loại hoạt động kho", required: true }),
    stock_location_id: fields.Many2one("stock.location", { string: "Vị trí tồn", required: true }),
    payment_method_ids: fields.Many2many("pos.payment.method", { string: "Phương thức thanh toán", relation: "pos_config_payment_method_rel" }),
    module_pos_discount: fields.Boolean({ string: "Cho phép giảm giá", default: true }),
    iface_tax_included: fields.Selection([["subtotal", "Chưa gồm thuế"], ["total", "Đã gồm thuế"]], { string: "Hiển thị thuế", default: "total" }),
  };
}

export class PosSession extends PosBase {
  static override modelName = "pos.session";
  static override description = "Ca bán hàng";
  static override tableName = "pos_session";
  static override fields = {
    name: fields.Char({ string: "Tên ca", required: true, index: true }),
    config_id: fields.Many2one("pos.config", { string: "Điểm bán", required: true, index: true }),
    state: fields.Selection(sessionState, { string: "Trạng thái", required: true, default: "opening_control", index: true }),
    start_at: fields.Datetime({ string: "Bắt đầu" }),
    stop_at: fields.Datetime({ string: "Kết thúc" }),
    cash_register_balance_start: fields.Float({ string: "Tiền đầu ca", default: 0 }),
    cash_register_balance_end_real: fields.Float({ string: "Tiền cuối ca", default: 0 }),
    order_ids: fields.One2many("pos.order", "session_id", { string: "Đơn hàng", readonly: true }),
  };
}

export class PosOrder extends PosBase {
  static override modelName = "pos.order";
  static override description = "Đơn bán POS";
  static override tableName = "pos_order";
  static override fields = {
    name: fields.Char({ string: "Mã đơn", required: true, index: true }),
    uuid: fields.Char({ string: "UUID", required: true, index: true }),
    session_id: fields.Many2one("pos.session", { string: "Ca bán hàng", required: true, index: true }),
    config_id: fields.Many2one("pos.config", { string: "Điểm bán", required: true, index: true }),
    date_order: fields.Datetime({ string: "Ngày bán", required: true, default: () => new Date().toISOString(), index: true }),
    sequence_number: fields.Integer({ string: "Số thứ tự", default: 1 }),
    partner_name: fields.Char({ string: "Khách hàng" }),
    state: fields.Selection(orderState, { string: "Trạng thái", required: true, default: "draft", index: true }),
    amount_tax: fields.Float({ string: "Thuế", default: 0 }),
    amount_total: fields.Float({ string: "Tổng cộng", default: 0 }),
    amount_paid: fields.Float({ string: "Đã thanh toán", default: 0 }),
    amount_return: fields.Float({ string: "Tiền thừa", default: 0 }),
    lines: fields.One2many("pos.order.line", "order_id", { string: "Chi tiết", readonly: true }),
    payment_ids: fields.One2many("pos.payment", "pos_order_id", { string: "Thanh toán", readonly: true }),
    picking_id: fields.Many2one("stock.picking", { string: "Phiếu xuất kho" }),
    note: fields.Text({ string: "Ghi chú" }),
  };
}

export class PosOrderLine extends PosBase {
  static override modelName = "pos.order.line";
  static override description = "Dòng đơn POS";
  static override tableName = "pos_order_line";
  static override fields = {
    name: fields.Char({ string: "Mô tả", required: true }),
    order_id: fields.Many2one("pos.order", { string: "Đơn POS", required: true, index: true }),
    product_id: fields.Many2one("product.product", { string: "Sản phẩm", required: true, index: true }),
    full_product_name: fields.Char({ string: "Tên đầy đủ", required: true }),
    qty: fields.Float({ string: "Số lượng", required: true, default: 1 }),
    price_unit: fields.Float({ string: "Đơn giá", required: true, default: 0 }),
    discount: fields.Float({ string: "Giảm giá (%)", default: 0 }),
    price_subtotal: fields.Float({ string: "Thành tiền", default: 0 }),
    price_subtotal_incl: fields.Float({ string: "Tổng gồm thuế", default: 0 }),
  };
}

export class PosPayment extends PosBase {
  static override modelName = "pos.payment";
  static override description = "Thanh toán POS";
  static override tableName = "pos_payment";
  static override fields = {
    name: fields.Char({ string: "Tham chiếu", required: true }),
    pos_order_id: fields.Many2one("pos.order", { string: "Đơn POS", required: true, index: true }),
    payment_method_id: fields.Many2one("pos.payment.method", { string: "Phương thức", required: true, index: true }),
    amount: fields.Float({ string: "Số tiền", required: true, default: 0 }),
    payment_date: fields.Datetime({ string: "Ngày thanh toán", required: true, default: () => new Date().toISOString() }),
    is_change: fields.Boolean({ string: "Tiền thừa", default: false }),
  };
}

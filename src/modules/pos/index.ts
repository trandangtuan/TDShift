import type { ModulePlugin } from "../../core/types";
import { PosConfig, PosOrder, PosOrderLine, PosPayment, PosPaymentMethod, PosSession } from "./models";

export const posModule: ModulePlugin = {
  manifest: {
    name: "point_of_sale",
    displayName: "Điểm bán hàng",
    version: "1.0.0",
    summary: "Bán hàng POS offline, thanh toán và xuất kho",
    depends: ["base", "product", "stock"],
    autoInstall: true,
  },
  models: [PosPaymentMethod, PosConfig, PosSession, PosOrder, PosOrderLine, PosPayment],
  menus: [
    { id: "pos.menu_root", name: "Điểm bán hàng", sequence: 15, icon: "storefront-outline" },
    { id: "pos.menu_sale", name: "Bán hàng", parentId: "pos.menu_root", sequence: 10, screen: "pos.sale" },
    { id: "pos.menu_orders_group", name: "Đơn hàng", parentId: "pos.menu_root", sequence: 20 },
    { id: "pos.menu_orders", name: "Đơn POS", parentId: "pos.menu_orders_group", sequence: 10, modelName: "pos.order" },
    { id: "pos.menu_payments", name: "Thanh toán", parentId: "pos.menu_orders_group", sequence: 20, modelName: "pos.payment" },
    { id: "pos.menu_sessions", name: "Ca bán hàng", parentId: "pos.menu_root", sequence: 30, modelName: "pos.session" },
    { id: "pos.menu_config_group", name: "Cấu hình", parentId: "pos.menu_root", sequence: 40 },
    { id: "pos.menu_configs", name: "Điểm bán", parentId: "pos.menu_config_group", sequence: 10, modelName: "pos.config" },
    { id: "pos.menu_payment_methods", name: "Phương thức thanh toán", parentId: "pos.menu_config_group", sequence: 20, modelName: "pos.payment.method" },
  ],
  views: {
    "pos.payment.method": {
      list: { type: "list", title: "Phương thức thanh toán", fields: ["name", "is_cash_count", "active"] },
      form: { type: "form", title: "Phương thức thanh toán", fields: ["name", "is_cash_count", "split_transactions", "sequence", "active"] },
    },
    "pos.config": {
      list: { type: "list", title: "Điểm bán", fields: ["name", "stock_location_id", "active"] },
      form: { type: "form", title: "Điểm bán", fields: ["name", "picking_type_id", "stock_location_id", "payment_method_ids", "module_pos_discount", "iface_tax_included", "active"] },
    },
    "pos.session": {
      list: { type: "list", title: "Ca bán hàng", fields: ["name", "start_at", "state"] },
      form: { type: "form", title: "Ca bán hàng", fields: ["name", "config_id", "state", "start_at", "stop_at", "cash_register_balance_start", "cash_register_balance_end_real", "order_ids", "active"] },
    },
    "pos.order": {
      list: { type: "list", title: "Đơn POS", fields: ["name", "date_order", "amount_total", "state"] },
      form: { type: "form", title: "Đơn POS", fields: ["name", "uuid", "session_id", "config_id", "date_order", "partner_name", "state", "amount_tax", "amount_total", "amount_paid", "amount_return", "lines", "payment_ids", "picking_id", "note", "active"] },
    },
    "pos.order.line": {
      list: { type: "list", title: "Chi tiết POS", fields: ["full_product_name", "qty", "price_unit", "price_subtotal_incl"] },
      form: { type: "form", title: "Chi tiết POS", fields: ["order_id", "product_id", "full_product_name", "qty", "price_unit", "discount", "price_subtotal", "price_subtotal_incl", "active"] },
    },
    "pos.payment": {
      list: { type: "list", title: "Thanh toán POS", fields: ["name", "amount", "payment_date"] },
      form: { type: "form", title: "Thanh toán POS", fields: ["name", "pos_order_id", "payment_method_id", "amount", "payment_date", "is_change", "active"] },
    },
  },
  async seed(env) {
    if ((await env.model("pos.config").searchRead({ limit: 1 })).length) return;
    const cash = await env.model("pos.payment.method").create({ name: "Tiền mặt", is_cash_count: true, sequence: 10, active: true });
    const bank = await env.model("pos.payment.method").create({ name: "Chuyển khoản", is_cash_count: false, sequence: 20, active: true });
    const outgoing = (await env.model("stock.picking.type").searchRead({ where: { code: "outgoing" }, limit: 1 }))[0];
    const stockLocation = outgoing ? await env.model("stock.location").read(outgoing.default_location_src_id as string) : null;
    if (!outgoing || !stockLocation) throw new Error("POS cần loại hoạt động xuất kho và vị trí tồn");
    const config = await env.model("pos.config").create({
      name: "Cửa hàng chính", picking_type_id: outgoing.id, stock_location_id: stockLocation.id,
      payment_method_ids: [cash.id, bank.id], module_pos_discount: true, iface_tax_included: "total", active: true,
    });
    await env.model("pos.session").create({
      name: `POS/SESSION/${new Date().toISOString().slice(0, 10)}`, config_id: config.id,
      state: "opened", start_at: new Date().toISOString(), cash_register_balance_start: 0, active: true,
    });
  },
};

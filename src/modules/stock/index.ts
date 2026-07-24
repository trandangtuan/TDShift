import type { ModulePlugin } from "../../core/types";
import { StockLocation, StockMove, StockPicking, StockPickingType, StockQuant, StockWarehouse } from "./models";

export const stockModule: ModulePlugin = {
  manifest: {
    name: "stock",
    displayName: "Kho vận",
    version: "1.0.0",
    summary: "Quản lý kho, vị trí, phiếu nhập xuất, dịch chuyển và tồn theo vị trí",
    depends: ["base", "product"],
    autoInstall: true,
  },
  models: [StockLocation, StockWarehouse, StockPickingType, StockPicking, StockMove, StockQuant],
  menus: [
    { id: "stock.menu_root", name: "Kho vận", sequence: 20, icon: "business-outline" },
    { id: "stock.menu_operations", name: "Hoạt động", parentId: "stock.menu_root", sequence: 10 },
    { id: "stock.menu_pickings", name: "Phiếu kho", parentId: "stock.menu_operations", sequence: 10, modelName: "stock.picking" },
    { id: "stock.menu_moves", name: "Dịch chuyển kho", parentId: "stock.menu_operations", sequence: 20, modelName: "stock.move" },
    { id: "stock.menu_products", name: "Sản phẩm", parentId: "stock.menu_root", sequence: 20 },
    { id: "stock.menu_quants", name: "Tồn theo vị trí", parentId: "stock.menu_products", sequence: 10, modelName: "stock.quant" },
    { id: "stock.menu_configuration", name: "Cấu hình", parentId: "stock.menu_root", sequence: 30 },
    { id: "stock.menu_warehouses", name: "Kho hàng", parentId: "stock.menu_configuration", sequence: 10, modelName: "stock.warehouse" },
    { id: "stock.menu_locations", name: "Vị trí", parentId: "stock.menu_configuration", sequence: 20, modelName: "stock.location" },
    { id: "stock.menu_picking_types", name: "Loại hoạt động", parentId: "stock.menu_configuration", sequence: 30, modelName: "stock.picking.type" },
  ],
  views: {
    "stock.location": {
      list: { type: "list", title: "Vị trí", fields: ["complete_name", "usage", "barcode", "active"] },
      form: { type: "form", title: "Vị trí", fields: ["name", "complete_name", "usage", "location_id", "warehouse_id", "barcode", "active"] },
    },
    "stock.warehouse": {
      list: { type: "list", title: "Kho hàng", fields: ["name", "code", "active"] },
      form: { type: "form", title: "Kho hàng", fields: ["name", "code", "lot_stock_id", "active"] },
    },
    "stock.picking.type": {
      list: { type: "list", title: "Loại hoạt động", fields: ["name", "code", "sequence_code", "active"] },
      form: { type: "form", title: "Loại hoạt động", fields: ["name", "code", "sequence_code", "warehouse_id", "default_location_src_id", "default_location_dest_id", "active"] },
    },
    "stock.picking": {
      list: { type: "list", title: "Phiếu kho", fields: ["name", "origin", "scheduled_date", "state"] },
      form: { type: "form", title: "Phiếu kho", fields: ["name", "origin", "picking_type_id", "location_id", "location_dest_id", "scheduled_date", "date_done", "state", "priority", "move_ids", "note", "active"] },
    },
    "stock.move": {
      list: { type: "list", title: "Dịch chuyển kho", fields: ["name", "product_id", "product_uom_qty", "quantity", "state"] },
      form: { type: "form", title: "Dịch chuyển kho", fields: ["name", "picking_id", "product_id", "product_uom_qty", "quantity", "location_id", "location_dest_id", "state", "date", "active"] },
    },
    "stock.quant": {
      list: { type: "list", title: "Tồn theo vị trí", fields: ["name", "product_id", "quantity", "reserved_quantity"] },
      form: { type: "form", title: "Tồn theo vị trí", fields: ["name", "product_id", "location_id", "quantity", "reserved_quantity", "inventory_quantity", "inventory_date", "active"] },
    },
  },
  async seed(env) {
    const warehouseModel = env.model("stock.warehouse");
    if ((await warehouseModel.searchRead({ limit: 1 })).length) return;

    const locationModel = env.model("stock.location");
    const vendor = await locationModel.create({ name: "Vendors", complete_name: "Partner Locations/Vendors", usage: "supplier", active: true });
    const customer = await locationModel.create({ name: "Customers", complete_name: "Partner Locations/Customers", usage: "customer", active: true });
    const inventory = await locationModel.create({ name: "Inventory adjustment", complete_name: "Virtual Locations/Inventory adjustment", usage: "inventory", active: true });
    const warehouseView = await locationModel.create({ name: "WH", complete_name: "WH", usage: "view", barcode: "WH", active: true });
    const stock = await locationModel.create({ name: "Stock", complete_name: "WH/Stock", usage: "internal", location_id: warehouseView.id, barcode: "WH-STOCK", active: true });
    const warehouse = await warehouseModel.create({ name: "Kho chính", code: "WH", lot_stock_id: stock.id, active: true });
    await locationModel.write(warehouseView.id as string, { warehouse_id: warehouse.id });
    await locationModel.write(stock.id as string, { warehouse_id: warehouse.id });

    const pickingTypeModel = env.model("stock.picking.type");
    const incoming = await pickingTypeModel.create({ name: "Nhập kho", sequence_code: "IN", code: "incoming", warehouse_id: warehouse.id, default_location_src_id: vendor.id, default_location_dest_id: stock.id, active: true });
    await pickingTypeModel.create({ name: "Xuất kho", sequence_code: "OUT", code: "outgoing", warehouse_id: warehouse.id, default_location_src_id: stock.id, default_location_dest_id: customer.id, active: true });
    await pickingTypeModel.create({ name: "Điều chuyển nội bộ", sequence_code: "INT", code: "internal", warehouse_id: warehouse.id, default_location_src_id: stock.id, default_location_dest_id: stock.id, active: true });

    const products = await env.model("product.product").searchRead({ limit: 1 });
    const product = products[0];
    if (!product) return;
    const picking = await env.model("stock.picking").create({
      name: "WH/IN/00001", origin: "INITIAL-STOCK", picking_type_id: incoming.id,
      location_id: vendor.id, location_dest_id: stock.id, scheduled_date: new Date().toISOString(),
      date_done: new Date().toISOString(), state: "done", priority: "0", active: true,
    });
    await env.model("stock.move").create({
      name: product.name, picking_id: picking.id, product_id: product.id,
      product_uom_qty: 12, quantity: 12, location_id: vendor.id, location_dest_id: stock.id,
      state: "done", date: new Date().toISOString(), active: true,
    });
    await env.model("stock.quant").create({
      name: `${String(product.name)} / WH/Stock`, product_id: product.id, location_id: stock.id,
      quantity: 12, reserved_quantity: 0, inventory_quantity: 12,
      inventory_date: new Date().toISOString().slice(0, 10), active: true,
    });
    void inventory;
  },
};

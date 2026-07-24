import type { Environment } from "../../core/Environment";
import type { ModelValues } from "../../core/types";
import type { InventoryOperation, InventoryScanLine, PosCatalogProduct } from "./types";

export class InventoryScanService {
  constructor(private readonly env: Environment) {}

  async findProduct(value: string): Promise<PosCatalogProduct | null> {
    const code = value.trim();
    if (!code) return null;
    const productModel = this.env.model("product.product");
    const product = (await productModel.searchRead({ where: { barcode: code }, limit: 1 }))[0]
      ?? (await productModel.searchRead({ where: { default_code: code }, limit: 1 }))[0];
    if (!product) return null;
    const template = await this.env.model("product.template").read(product.product_tmpl_id as string);
    return {
      id: product.id as string,
      name: String(product.name ?? template?.name ?? "Sản phẩm"),
      defaultCode: String(product.default_code ?? ""),
      barcode: String(product.barcode ?? ""),
      price: Number(template?.list_price ?? 0) + Number(product.extra_price ?? 0),
      templateId: product.product_tmpl_id as string,
    };
  }

  async validateAndCreate(operation: InventoryOperation, lines: InventoryScanLine[]): Promise<ModelValues> {
    const validLines = lines.filter((line) => Number.isFinite(line.qty) && line.qty > 0);
    if (!validLines.length) throw new Error("Chưa có sản phẩm hợp lệ");
    const pickingType = (await this.env.model("stock.picking.type").searchRead({ where: { code: operation }, limit: 1 }))[0];
    if (!pickingType) throw new Error(operation === "incoming" ? "Chưa cấu hình loại nhập kho" : "Chưa cấu hình loại xuất kho");
    const sourceId = pickingType.default_location_src_id as string;
    const destinationId = pickingType.default_location_dest_id as string;
    if (!sourceId || !destinationId) throw new Error("Loại hoạt động chưa có vị trí nguồn/đích mặc định");
    if (operation === "outgoing") await this.ensureStock(validLines, sourceId);

    const now = new Date();
    const sequence = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const prefix = operation === "incoming" ? "IN" : "OUT";
    const picking = await this.env.model("stock.picking").create({
      name: `WH/${prefix}/SCAN-${sequence}`,
      origin: `POS-QR-${sequence}`,
      picking_type_id: pickingType.id,
      location_id: sourceId,
      location_dest_id: destinationId,
      scheduled_date: now.toISOString(),
      date_done: now.toISOString(),
      state: "done",
      priority: "0",
      note: "Tạo từ chức năng quét QR/mã vạch tại POS",
      active: true,
    });
    for (const line of validLines) {
      await this.env.model("stock.move").create({
        name: line.product.name,
        picking_id: picking.id,
        product_id: line.product.id,
        product_uom_qty: line.qty,
        quantity: line.qty,
        location_id: sourceId,
        location_dest_id: destinationId,
        state: "done",
        date: now.toISOString(),
        active: true,
      });
      await this.adjustQuant(line.product, sourceId, -line.qty, now);
      await this.adjustQuant(line.product, destinationId, line.qty, now);
    }
    return picking;
  }

  private async ensureStock(lines: InventoryScanLine[], locationId: string): Promise<void> {
    for (const line of lines) {
      const quant = (await this.env.model("stock.quant").searchRead({ where: { product_id: line.product.id, location_id: locationId }, limit: 1 }))[0];
      const available = Number(quant?.quantity ?? 0) - Number(quant?.reserved_quantity ?? 0);
      if (available < line.qty) throw new Error(`${line.product.name}: tồn khả dụng ${available}, cần xuất ${line.qty}`);
    }
  }

  private async adjustQuant(product: PosCatalogProduct, locationId: string, delta: number, now: Date): Promise<void> {
    const location = await this.env.model("stock.location").read(locationId);
    const quant = (await this.env.model("stock.quant").searchRead({ where: { product_id: product.id, location_id: locationId }, limit: 1 }))[0];
    if (quant) {
      await this.env.model("stock.quant").write(quant.id as string, { quantity: Number(quant.quantity ?? 0) + delta });
      return;
    }
    await this.env.model("stock.quant").create({
      name: `${product.name} / ${String(location?.complete_name ?? location?.name ?? "Kho")}`,
      product_id: product.id,
      location_id: locationId,
      quantity: delta,
      reserved_quantity: 0,
      inventory_quantity: 0,
      inventory_date: now.toISOString().slice(0, 10),
      active: true,
    });
  }
}

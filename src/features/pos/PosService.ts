import type { Environment } from "../../core/Environment";
import type { ModelValues } from "../../core/types";
import type { PosCartLine, PosCatalogProduct, PosContext } from "./types";

export class PosService {
  constructor(private readonly env: Environment) {}

  async loadContext(): Promise<PosContext> {
    const session = (await this.env.model("pos.session").searchRead({ where: { state: "opened" }, limit: 1 }))[0];
    if (!session) throw new Error("Chưa có ca bán hàng đang mở");
    const config = await this.env.model("pos.config").read(session.config_id as string);
    if (!config) throw new Error("Không tìm thấy cấu hình điểm bán");
    const methodIds = (config.payment_method_ids as string[]) ?? [];
    const paymentMethods = (await Promise.all(methodIds.map((id) => this.env.model("pos.payment.method").read(id)))).filter(Boolean) as ModelValues[];
    return { config, session, paymentMethods };
  }

  async loadProducts(search = ""): Promise<PosCatalogProduct[]> {
    const products = await this.env.model("product.product").searchRead({ search, limit: 100 });
    const templates = new Map<string, ModelValues>();
    return Promise.all(products.map(async (product) => {
      const templateId = product.product_tmpl_id as string;
      let template = templates.get(templateId);
      if (!template) {
        template = await this.env.model("product.template").read(templateId) ?? {};
        templates.set(templateId, template);
      }
      return {
        id: product.id as string,
        name: String(product.name ?? template.name ?? "Sản phẩm"),
        defaultCode: String(product.default_code ?? ""),
        barcode: String(product.barcode ?? ""),
        price: Number(template.list_price ?? 0) + Number(product.extra_price ?? 0),
        templateId,
      };
    }));
  }

  lineTotal(line: PosCartLine): number {
    return line.qty * line.priceUnit * (1 - Math.min(100, Math.max(0, line.discount)) / 100);
  }

  async checkout(lines: PosCartLine[], paymentMethodId: string, customerName = ""): Promise<ModelValues> {
    if (!lines.length) throw new Error("Giỏ hàng đang trống");
    const context = await this.loadContext();
    if (!context.paymentMethods.some((method) => method.id === paymentMethodId)) throw new Error("Phương thức thanh toán không hợp lệ");
    const now = new Date();
    const uuid = `pos-${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
    const total = this.round(lines.reduce((sum, line) => sum + this.lineTotal(line), 0));
    const name = `POS/${now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)}`;
    const order = await this.env.model("pos.order").create({
      name, uuid, session_id: context.session.id, config_id: context.config.id,
      date_order: now.toISOString(), sequence_number: now.getTime(), partner_name: customerName,
      state: "draft", amount_tax: 0, amount_total: total, amount_paid: total,
      amount_return: 0, note: "", active: true,
    });

    for (const line of lines) {
      const subtotal = this.round(this.lineTotal(line));
      await this.env.model("pos.order.line").create({
        name: line.product.name, order_id: order.id, product_id: line.product.id,
        full_product_name: line.product.name, qty: line.qty, price_unit: line.priceUnit,
        discount: line.discount, price_subtotal: subtotal, price_subtotal_incl: subtotal, active: true,
      });
    }

    await this.env.model("pos.payment").create({
      name: `${name}/PAY`, pos_order_id: order.id, payment_method_id: paymentMethodId,
      amount: total, payment_date: now.toISOString(), is_change: false, active: true,
    });
    const picking = await this.createStockPicking(context, order, lines, now);
    return this.env.model("pos.order").write(order.id as string, { state: "done", picking_id: picking.id });
  }

  private async createStockPicking(context: PosContext, order: ModelValues, lines: PosCartLine[], now: Date): Promise<ModelValues> {
    const pickingType = await this.env.model("stock.picking.type").read(context.config.picking_type_id as string);
    if (!pickingType) throw new Error("Không tìm thấy loại hoạt động xuất kho");
    const sourceId = context.config.stock_location_id as string;
    const destinationId = pickingType.default_location_dest_id as string;
    const picking = await this.env.model("stock.picking").create({
      name: `WH/OUT/POS-${now.getTime()}`, origin: order.name, picking_type_id: pickingType.id,
      location_id: sourceId, location_dest_id: destinationId, scheduled_date: now.toISOString(),
      date_done: now.toISOString(), state: "done", priority: "0", active: true,
    });
    for (const line of lines) {
      await this.env.model("stock.move").create({
        name: line.product.name, picking_id: picking.id, product_id: line.product.id,
        product_uom_qty: line.qty, quantity: line.qty, location_id: sourceId,
        location_dest_id: destinationId, state: "done", date: now.toISOString(), active: true,
      });
      await this.adjustQuant(line.product, sourceId, -line.qty, now);
      await this.adjustQuant(line.product, destinationId, line.qty, now);
    }
    return picking;
  }

  private async adjustQuant(product: PosCartLine["product"], locationId: string, delta: number, now: Date): Promise<void> {
    const quant = (await this.env.model("stock.quant").searchRead({ where: { product_id: product.id, location_id: locationId }, limit: 1 }))[0];
    if (quant) {
      await this.env.model("stock.quant").write(quant.id as string, { quantity: Number(quant.quantity ?? 0) + delta });
      return;
    }
    await this.env.model("stock.quant").create({
      name: `${product.name} / POS`, product_id: product.id, location_id: locationId,
      quantity: delta, reserved_quantity: 0, inventory_quantity: 0,
      inventory_date: now.toISOString().slice(0, 10), active: true,
    });
  }

  private round(value: number): number { return Math.round((value + Number.EPSILON) * 100) / 100; }
}

import type { ModelValues } from "../../core/types";

export interface PosCatalogProduct {
  id: string;
  name: string;
  defaultCode: string;
  barcode: string;
  price: number;
  templateId: string;
}

export interface PosCartLine {
  key: string;
  product: PosCatalogProduct;
  qty: number;
  priceUnit: number;
  discount: number;
}

export interface PosContext {
  config: ModelValues;
  session: ModelValues;
  paymentMethods: ModelValues[];
}

export type InventoryOperation = "incoming" | "outgoing";

export interface InventoryScanLine {
  product: PosCatalogProduct;
  qty: number;
}

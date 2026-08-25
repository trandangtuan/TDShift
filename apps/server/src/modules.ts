import type { ModuleDefinition } from "@record-platform/core";
import ai from "../../../modules/ai/module";
import accounting from "../../../modules/accounting/module";
import base from "../../../modules/base/module";
import contacts from "../../../modules/contacts/module";
import product from "../../../modules/product/module";
import sale from "../../../modules/sale/module";
import saleDiscount from "../../../modules/sale_discount/module";
import stock from "../../../modules/stock/module";
import purchase from "../../../modules/purchase/module";
import website from "../../../modules/website/module";
import mcp from "../../../modules/mcp/module";

export const moduleDefinitions: ModuleDefinition[] = [base, contacts, product, accounting, stock, sale, purchase, saleDiscount, website, ai, mcp];

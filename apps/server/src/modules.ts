import type { ModuleDefinition } from "@record-platform/core";
import base from "../../../modules/base/module";
import contacts from "../../../modules/contacts/module";
import sale from "../../../modules/sale/module";
import saleDiscount from "../../../modules/sale_discount/module";
import website from "../../../modules/website/module";
import mcp from "../../../modules/mcp/module";

export const moduleDefinitions: ModuleDefinition[] = [base, contacts, sale, saleDiscount, website, mcp];

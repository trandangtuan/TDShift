import type { ModuleDefinition } from "@record-platform/core";
import base from "../../../modules/base/module";
import contacts from "../../../modules/contacts/module";
import sale from "../../../modules/sale/module";
import saleDiscount from "../../../modules/sale_discount/module";

export const moduleDefinitions: ModuleDefinition[] = [base, contacts, sale, saleDiscount];

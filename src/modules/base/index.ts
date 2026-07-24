import type { ModulePlugin } from "../../core/types";
import { IrAttachment } from "./models";

export const baseModule: ModulePlugin = {
  manifest: {
    name: "base",
    displayName: "TDshift Base",
    version: "1.0.0",
    summary: "Model hệ thống và dịch vụ tệp đính kèm",
    autoInstall: true,
  },
  models: [IrAttachment],
  menus: [
    { id: "base.menu_system", name: "Hệ thống", sequence: 90, icon: "settings-outline" },
    { id: "base.menu_technical", name: "Kỹ thuật", parentId: "base.menu_system", sequence: 10 },
    { id: "base.menu_attachments", name: "Tệp đính kèm", parentId: "base.menu_technical", sequence: 10, modelName: "ir.attachment" },
  ],
  views: {
    "ir.attachment": {
      list: { type: "list", title: "Tệp đính kèm", fields: ["name", "mimetype", "file_size"] },
      form: { type: "form", title: "Tệp đính kèm", fields: ["name", "mimetype", "file_size", "local_uri", "res_model", "res_id", "active"] },
    },
  },
};

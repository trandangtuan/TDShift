import type { MenuDefinition } from "@record-platform/core";

export const baseMenu: MenuDefinition[] = [
  { technicalName: "base.menu_settings", name: "Cài đặt", icon: "settings", sequence: 90 },
  { technicalName: "base.menu_users", name: "Người dùng", parent: "base.menu_settings", action: "base.action_users", sequence: 5 },
  { technicalName: "base.menu_technical", name: "Kỹ thuật", parent: "base.menu_settings", sequence: 10 },
  { technicalName: "base.menu_modules", name: "Module", parent: "base.menu_technical", action: "base.action_modules", sequence: 5 },
  { technicalName: "base.menu_models", name: "Model", parent: "base.menu_technical", action: "base.action_models", sequence: 10 },
  { technicalName: "base.menu_fields", name: "Field", parent: "base.menu_technical", action: "base.action_fields", sequence: 20 },
  { technicalName: "base.menu_views", name: "View", parent: "base.menu_technical", action: "base.action_views", sequence: 30 },
  { technicalName: "base.menu_menus", name: "Menu", parent: "base.menu_technical", action: "base.action_menus", sequence: 40 },
  { technicalName: "base.menu_attachments", name: "Tệp đính kèm", parent: "base.menu_technical", action: "base.action_attachments", sequence: 50 }
];

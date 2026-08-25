import type { MenuDefinition } from "@record-platform/core";

export const baseMenus: MenuDefinition[] = [
  { technicalName: "base.menu_settings", name: "Settings", icon: "settings", sequence: 90 },
  { technicalName: "base.menu_users", name: "Users", parent: "base.menu_settings", action: "base.action_users", sequence: 5 },
  { technicalName: "base.menu_technical", name: "Technical", parent: "base.menu_settings", sequence: 10 },
  { technicalName: "base.menu_modules", name: "Modules", parent: "base.menu_technical", action: "base.action_modules", sequence: 5 },
  { technicalName: "base.menu_models", name: "Models", parent: "base.menu_technical", action: "base.action_models", sequence: 10 },
  { technicalName: "base.menu_fields", name: "Fields", parent: "base.menu_technical", action: "base.action_fields", sequence: 20 },
  { technicalName: "base.menu_views", name: "Views", parent: "base.menu_technical", action: "base.action_views", sequence: 30 },
  { technicalName: "base.menu_menus", name: "Menus", parent: "base.menu_technical", action: "base.action_menus", sequence: 40 },
  { technicalName: "base.menu_attachments", name: "Attachments", parent: "base.menu_technical", action: "base.action_attachments", sequence: 50 }
];

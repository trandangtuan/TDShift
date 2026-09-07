import type { ActionDefinition } from "@record-platform/core";

export const baseActions: ActionDefinition[] = [
  { technicalName: "base.action_modules", name: "Module", type: "window", model: "core.module", viewModes: ["list", "form"] },
  { technicalName: "base.action_models", name: "Model", type: "window", model: "core.model", viewModes: ["list", "form"] },
  { technicalName: "base.action_fields", name: "Field", type: "window", model: "core.model.field", viewModes: ["list", "form"] },
  { technicalName: "base.action_views", name: "View", type: "window", model: "core.view", viewModes: ["list", "form"] },
  { technicalName: "base.action_menus", name: "Menu", type: "window", model: "core.menu", viewModes: ["list", "form"] },
  { technicalName: "base.action_users", name: "Người dùng", type: "window", model: "core.user", viewModes: ["list", "form"] },
  { technicalName: "base.action_attachments", name: "Tệp đính kèm", type: "window", model: "ir.attachment", viewModes: ["list", "form"] }
];

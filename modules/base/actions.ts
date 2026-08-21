import type { ActionDefinition } from "@record-platform/core";

export const baseActions: ActionDefinition[] = [
  { technicalName: "base.action_modules", name: "Modules", type: "window", model: "core.module", viewModes: ["list", "form"] },
  { technicalName: "base.action_models", name: "Models", type: "window", model: "core.model", viewModes: ["list", "form"] },
  { technicalName: "base.action_fields", name: "Fields", type: "window", model: "core.model.field", viewModes: ["list", "form"] },
  { technicalName: "base.action_views", name: "Views", type: "window", model: "core.view", viewModes: ["list", "form"] },
  { technicalName: "base.action_menus", name: "Menus", type: "window", model: "core.menu", viewModes: ["list", "form"] },
  { technicalName: "base.action_users", name: "Users", type: "window", model: "core.user", viewModes: ["list", "form"] }
];

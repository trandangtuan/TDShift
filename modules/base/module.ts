import { defineModule } from "@record-platform/core";
import { baseActions } from "./actions";
import { baseMenus } from "./menus";
import { actionModel, externalIdModel, menuModel, modelFieldModel, modelModel, moduleModel, userModel, viewModel } from "./models";
import { baseRoutes } from "./routes";
import { menuViews, modelFieldViews, modelViews, moduleViews, userViews, viewViews } from "./views";

export default defineModule({
  technicalName: "base",
  displayName: "Base",
  version: "1.0.0",
  description: "Core metadata and platform primitives.",
  sequence: 1,
  models: [moduleModel, modelModel, modelFieldModel, viewModel, actionModel, menuModel, externalIdModel, userModel],
  views: [...moduleViews, ...modelViews, ...modelFieldViews, ...viewViews, ...menuViews, ...userViews],
  actions: baseActions,
  menus: baseMenus,
  routes: baseRoutes
});

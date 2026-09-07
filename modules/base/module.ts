import { defineModule } from "@record-platform/core";
import { baseActions } from "./actions";
import { baseMenu } from "./menus";
import { actionModel, attachmentModel, externalIdModel, menuModel, modelFieldModel, modelModel, moduleModel, userModel, viewModel } from "./models";
import { baseRoutes } from "./routes";
import { attachmentView, menuView, modelFieldView, modelView, moduleView, userView, viewView } from "./views";

export default defineModule({
  technicalName: "base",
  displayName: "Nền tảng",
  version: "1.1.0",
  description: "Metadata lõi và các thành phần nền tảng.",
  sequence: 1,
  models: [moduleModel, modelModel, modelFieldModel, viewModel, actionModel, menuModel, externalIdModel, userModel, attachmentModel],
  views: [...moduleView, ...modelView, ...modelFieldView, ...viewView, ...menuView, ...userView, ...attachmentView],
  actions: baseActions,
  menus: baseMenu,
  routes: baseRoutes
});

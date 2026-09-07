import { defineModule } from "@record-platform/core";
import { discussChannelMemberModel, discussChannelModel, discussMessageModel, discussMessageReadModel } from "./models";
import { discussChannelMemberView, discussChannelView, discussMessageView } from "./views";
import { discussRoutes } from "./routes";

export default defineModule({
  technicalName: "discuss",
  displayName: "Discuss",
  version: "1.1.0",
  depends: ["base"],
  sequence: 15,
  models: [discussChannelModel, discussChannelMemberModel, discussMessageModel, discussMessageReadModel],
  views: [...discussChannelView, ...discussChannelMemberView, ...discussMessageView],
  actions: [
    { technicalName: "discuss.action_channels", name: "Channels", type: "window", model: "discuss.channel", viewModes: ["list", "form"] },
    { technicalName: "discuss.action_chat", name: "Chat", type: "client" },
    { technicalName: "discuss.action_members", name: "Channel Members", type: "window", model: "discuss.channel.member", viewModes: ["list", "form"] },
    { technicalName: "discuss.action_messages", name: "Messages", type: "window", model: "discuss.message", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "discuss.menu_root", name: "Discuss", icon: "comments", sequence: 15 },
    { technicalName: "discuss.menu_chat", name: "Chat", parent: "discuss.menu_root", action: "discuss.action_chat", sequence: 5 },
    // { technicalName: "discuss.menu_channels", name: "Channels", parent: "discuss.menu_root", action: "discuss.action_channels", sequence: 10 },
    // { technicalName: "discuss.menu_members", name: "Channel Members", parent: "discuss.menu_root", action: "discuss.action_members", sequence: 20 },
    // { technicalName: "discuss.menu_messages", name: "Messages", parent: "discuss.menu_root", action: "discuss.action_messages", sequence: 30 }
  ],
  routes: discussRoutes
});
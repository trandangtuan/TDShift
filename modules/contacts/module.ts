import { defineModule } from "@record-platform/core";
import { partnerData } from "./data";
import { partnerModel } from "./models";
import { partnerViews } from "./views";

export default defineModule({
  technicalName: "contacts",
  displayName: "Contacts",
  version: "1.0.0",
  depends: ["base"],
  sequence: 10,
  models: [partnerModel],
  views: partnerViews,
  actions: [{ technicalName: "contacts.action_contacts", name: "Contacts", type: "window", model: "res.partner", viewModes: ["list", "form"] }],
  menus: [{ technicalName: "contacts.menu_contacts", name: "Contacts", action: "contacts.action_contacts", icon: "users", sequence: 20 }],
  data: partnerData
});

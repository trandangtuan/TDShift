import { defineModule } from "@record-platform/core";
import { partnerData } from "./data";
import { partnerModel } from "./models";
import { partnerView } from "./views";

export default defineModule({
  technicalName: "contacts",
  displayName: "Liên hệ",
  version: "1.0.0",
  depends: ["base"],
  sequence: 10,
  models: [partnerModel],
  views: partnerView,
  actions: [{ technicalName: "contacts.action_contacts", name: "Liên hệ", type: "window", model: "res.partner", viewModes: ["list", "form"] }],
  menus: [{ technicalName: "contacts.menu_contacts", name: "Liên hệ", action: "contacts.action_contacts", icon: "users", sequence: 20 }],
  data: partnerData
});

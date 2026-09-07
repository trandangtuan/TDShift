import { defineModule } from "@record-platform/core";
import { galleryImageModel } from "./models/image";
import { galleryRoutes } from "./routes";
import { galleryView } from "./views";

export default defineModule({
  technicalName: "gallery",
  displayName: "Thư viện ảnh",
  version: "1.0.0",
  description: "Private image storage and browsing.",
  depends: ["base"],
  sequence: 25,
  models: [galleryImageModel],
  views: galleryView,
  actions: [
    { technicalName: "gallery.action_gallery", name: "Gallery", type: "client" },
    { technicalName: "gallery.action_timeline", name: "Timeline", type: "client" }
  ],
  menus: [
    { technicalName: "gallery.menu_root", name: "Thư viện ảnh", icon: "image", sequence: 25 },
    { technicalName: "gallery.menu_gallery", name: "Gallery", parent: "gallery.menu_root", action: "gallery.action_gallery", sequence: 10 },
    { technicalName: "gallery.menu_timeline", name: "Timeline", parent: "gallery.menu_root", action: "gallery.action_timeline", sequence: 20 }
  ],
  routes: galleryRoutes
});
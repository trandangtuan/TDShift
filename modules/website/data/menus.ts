import type { DataRecordDefinition } from "@record-platform/core";

export const websiteMenuData: DataRecordDefinition[] = [
  {
    externalId: "website.menu_home",
    model: "website.menu",
    values: {
      name: "Home",
      label: "Home",
      url: "/",
      page_slug: "home",
      sequence: 10,
      is_published: true,
      active: true
    }
  },
  {
    externalId: "website.menu_features",
    model: "website.menu",
    values: {
      name: "Features",
      label: "Tính năng",
      url: "/features",
      page_slug: "features",
      sequence: 20,
      is_published: true,
      active: true
    }
  },
  {
    externalId: "website.menu_module_guide",
    model: "website.menu",
    values: {
      name: "Module Guide",
      label: "Hướng dẫn",
      url: "/module-guide",
      page_slug: "module-guide",
      sequence: 30,
      is_published: true,
      active: true
    }
  }
];

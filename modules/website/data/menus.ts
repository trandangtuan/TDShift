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
  }
];

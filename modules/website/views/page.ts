import type { ViewDefinition } from "@record-platform/core";

export const pageViews: ViewDefinition[] = [
  {
    technicalName: "website.page_home.view",
    name: "Home Page Content",
    model: "website.page",
    type: "page",
    contentType: "html",
    content: "<section class=\"mx-auto max-w-4xl px-6 py-16\"><p class=\"mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600\">Record Platform</p><h1 class=\"text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl\">Welcome</h1><p class=\"mt-5 max-w-2xl text-lg leading-8 text-slate-600\">This page is rendered from a core.view HTML record styled with Tailwind CSS classes.</p></section>",
    architecture: {
      type: "form",
      model: "website.page",
      children: []
    }
  },
  {
    technicalName: "website.page.list",
    name: "Pages",
    model: "website.page",
    type: "list",
    architecture: {
      type: "list",
      model: "website.page",
      fields: ["name", "slug", "url", "title", "view_name", "is_published", "published_at", "active"]
    }
  },
  {
    technicalName: "website.page.form",
    name: "Page",
    model: "website.page",
    type: "form",
    architecture: {
      type: "form",
      model: "website.page",
      children: [
        {
          type: "group",
          children: [
            { type: "field", name: "name" },
            { type: "field", name: "slug" },
            { type: "field", name: "url" },
            { type: "field", name: "title" },
            { type: "field", name: "meta_description" },
            { type: "field", name: "view_name" },
            { type: "field", name: "is_published" },
            { type: "field", name: "published_at" },
            { type: "field", name: "active" }
          ]
        }
      ]
    }
  }
];

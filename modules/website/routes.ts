import type { ModuleRoute } from "@record-platform/core";

export const websiteRoutes: ModuleRoute[] = [
  {
    register({ app, db }) {
      app.get("/", async (_request: any, reply: any) => renderWebsitePage(db, "home", reply));
      app.get("/:slug", async (request: any, reply: any) => {
        if (request.url.startsWith("/api/") || request.url.startsWith("/assets/") || request.url.startsWith("/web")) return reply.callNotFound();
        return renderWebsitePage(db, request.params.slug, reply);
      });
    }
  }
];

function renderWebsitePage(db: any, slug: string, reply: any) {
  const normalizedSlug = normalizeSlug(slug);
  const page = getPublishedWebsitePage(db, normalizedSlug);
  if (!page) return reply.code(404).type("text/html").send(renderNotFound(normalizedSlug));
  return reply.type("text/html").send(renderPage(db, page, getPublishedWebsiteMenus(db)));
}

function getPublishedWebsitePage(db: any, slug: string) {
  const hasViewName = tableHasColumn(db, "website_page", "view_name");
  const hasLegacyContent = tableHasColumn(db, "website_page", "content_html");
  return db.prepare(`
    SELECT title, meta_description${hasViewName ? ", view_name" : ""}${hasLegacyContent ? ", content_html" : ""}
    FROM website_page
    WHERE slug = ? AND is_published = 1 AND active = 1
    ORDER BY id DESC LIMIT 1
  `).get(slug) as { title: string; meta_description: string | null; view_name?: string | null; content_html?: string | null } | undefined;
}

function normalizeSlug(slug: string) {
  const trimmed = slug.trim().replace(/^\/+|\/+$/g, "");
  return trimmed || "home";
}

function getPublishedWebsiteMenus(db: any) {
  return db.prepare(`
    SELECT label, url FROM website_menu
    WHERE is_published = 1 AND active = 1
    ORDER BY sequence, id
  `).all() as Array<{ label: string | null; url: string | null }>;
}

function renderPage(db: any, page: { title: string; meta_description: string | null; view_name?: string | null; content_html?: string | null }, menus: Array<{ label: string | null; url: string | null }>) {
  const links = menus.filter((menu) => menu.label && menu.url).map((menu) => `<a href="${escapeHtml(menu.url)}">${escapeHtml(menu.label)}</a>`);
  const navigation = links.length ? `<nav>${links.join("")}</nav>` : "";
  const content = getWebsiteViewContent(db, page.view_name) ?? page.content_html ?? "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.meta_description ?? "")}">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { color: #222832; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; margin: 0; }
      nav { align-items: center; border-bottom: 1px solid #e5e7eb; display: flex; gap: 24px; padding: 16px 20px; }
      nav a { color: #111827; font-weight: 600; text-decoration: none; }
      main { margin: 0 auto; max-width: 920px; padding: 48px 20px; }
      h1 { font-size: 40px; line-height: 1.15; margin: 0 0 18px; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    ${navigation}
    <main>${content}</main>
  </body>
</html>`;
}

function getWebsiteViewContent(db: any, viewName: string | null | undefined) {
  if (!viewName) return null;
  const view = db.prepare(`SELECT content, content_type FROM core_view WHERE technical_name = ? AND is_active = 1 LIMIT 1`).get(viewName) as { content: string | null; content_type: string | null } | undefined;
  if (!view || view.content_type !== "html") return null;
  return view.content ?? "";
}

function renderNotFound(slug: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found</title></head><body><main><h1>Page not found</h1><p>No published page for ${escapeHtml(slug)}.</p></main></body></html>`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function tableHasColumn(db: any, tableName: string, columnName: string) {
  return (db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>).some((column) => column.name === columnName);
}

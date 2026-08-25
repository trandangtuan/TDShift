import type { ModuleRoute } from "@record-platform/core";

const PAGE_CACHE_TTL_MS = 30_000;
const schemaCache = new WeakMap<object, WebsiteSchema>();
const pageCache = new WeakMap<object, Map<string, CachedPage>>();

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
  const cached = getCachedPage(db, normalizedSlug);
  if (cached) return sendHtml(reply, cached.html, cached.status);
  const page = getPublishedWebsitePage(db, normalizedSlug);
  if (!page) {
    const html = renderNotFound(normalizedSlug);
    setCachedPage(db, normalizedSlug, { html, status: 404 });
    return sendHtml(reply, html, 404);
  }
  const html = renderPage(db, page, getPublishedWebsiteMenus(db));
  setCachedPage(db, normalizedSlug, { html, status: 200 });
  return sendHtml(reply, html, 200);
}

function getPublishedWebsitePage(db: any, slug: string) {
  const { pageHasViewName, pageHasLegacyContent } = getWebsiteSchema(db);
  return db.prepare(`
    SELECT title, meta_description${pageHasViewName ? ", view_name" : ""}${pageHasLegacyContent ? ", content_html" : ""}
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
      body { background: #f6f8fb; color: #222832; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; margin: 0; }
      body > nav { align-items: center; background: rgba(255,255,255,0.86); backdrop-filter: blur(16px); border-bottom: 1px solid #e5e7eb; display: flex; gap: 24px; justify-content: center; padding: 14px 20px; position: sticky; top: 0; z-index: 20; }
      body > nav a { color: #111827; font-weight: 700; text-decoration: none; }
      body > nav a:hover { color: #0f766e; }
      main { margin: 0 auto; max-width: 1180px; padding: 28px 20px 54px; }
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

function sendHtml(reply: any, html: string, status: number) {
  return reply
    .code(status)
    .type("text/html; charset=utf-8")
    .header("Cache-Control", status === 200 ? "public, max-age=30, stale-while-revalidate=120" : "public, max-age=10")
    .send(html);
}

function getCachedPage(db: object, slug: string) {
  const cached = pageCache.get(db)?.get(slug);
  if (!cached || cached.expiresAt <= Date.now()) return null;
  return cached;
}

function setCachedPage(db: object, slug: string, page: Omit<CachedPage, "expiresAt">) {
  let pages = pageCache.get(db);
  if (!pages) {
    pages = new Map();
    pageCache.set(db, pages);
  }
  pages.set(slug, { ...page, expiresAt: Date.now() + PAGE_CACHE_TTL_MS });
}

function getWebsiteSchema(db: object) {
  const cached = schemaCache.get(db);
  if (cached) return cached;
  const schema = {
    pageHasViewName: tableHasColumn(db, "website_page", "view_name"),
    pageHasLegacyContent: tableHasColumn(db, "website_page", "content_html")
  };
  schemaCache.set(db, schema);
  return schema;
}

function tableHasColumn(db: any, tableName: string, columnName: string) {
  return (db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>).some((column) => column.name === columnName);
}

type WebsiteSchema = {
  pageHasViewName: boolean;
  pageHasLegacyContent: boolean;
};

type CachedPage = {
  html: string;
  status: number;
  expiresAt: number;
};

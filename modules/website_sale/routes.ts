import type { ModuleRoute } from "@record-platform/core";

export const websiteSaleRoutes: ModuleRoute[] = [{
  register({ app, db }) {
    app.get("/api/website-sale/products", async () => ({ products: publishedProducts(db) }));
    app.get("/api/website-sale/products/:slug", async (request: any, reply: any) => {
      const product = publishedProducts(db).find((candidate) => candidate.slug === request.params.slug);
      if (!product) return reply.code(404).send({ error: "Product not found" });
      return { product };
    });
  }
}];

function publishedProducts(db: any) {
  const rows = db.prepare(`
    SELECT id, name, default_code, list_price
    FROM product_product
    WHERE active = 1
    ORDER BY name, id
  `).all() as Array<{ id: number; name: string; default_code: string | null; list_price: number | null }>;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: `${slugify(row.name)}-${row.id}`,
    default_code: row.default_code,
    list_price: row.list_price ?? 0
  }));
}

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product";
}

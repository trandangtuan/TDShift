import { unstable_cache } from "next/cache";

const apiBase = process.env.WEBSITE_API_URL ?? "http://localhost:3100";

type WebsiteMenu = { label: string | null; url: string | null };
export type WebsitePage = { title: string; meta_description: string | null; content: string };
export type WebsitePageData = { page: WebsitePage; menus: WebsiteMenu[] };
export type WebsiteProduct = { id: number; name: string; slug: string; default_code: string | null; list_price: number };

export async function getWebsitePage(slug: string): Promise<WebsitePageData | null> {
  return getCachedWebsitePage(slug);
}

const getCachedWebsitePage = unstable_cache(async (slug: string) => {
  const response = await fetch(`${apiBase}/api/website/pages/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Website API failed with ${response.status}`);
  return response.json() as Promise<WebsitePageData>;
}, ["website-page"], { revalidate: 30 });

export async function getWebsiteProducts(): Promise<WebsiteProduct[]> {
  const response = await fetch(`${apiBase}/api/website-sale/products`);
  if (!response.ok) throw new Error(`Website product API failed with ${response.status}`);
  const result = await response.json() as { products: WebsiteProduct[] };
  return result.products;
}

export async function getWebsiteProduct(slug: string): Promise<WebsiteProduct | null> {
  const response = await fetch(`${apiBase}/api/website-sale/products/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Website product API failed with ${response.status}`);
  const result = await response.json() as { product: WebsiteProduct };
  return result.product;
}

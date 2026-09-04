import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductCatalog";
import { getWebsiteProduct } from "@/lib/website";

type ProductPageProps = { params: Promise<{ slug: string }> };

export const revalidate = 30;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getWebsiteProduct((await params).slug);
  return product ? { title: `${product.name} | MetaFlow` } : { title: "Product not found" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getWebsiteProduct((await params).slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}

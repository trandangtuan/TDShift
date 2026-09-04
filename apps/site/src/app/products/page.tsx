import { ProductCatalog } from "@/components/ProductCatalog";
import { getWebsiteProducts } from "@/lib/website";

export const revalidate = 30;

export default async function ProductsPage() {
  return <ProductCatalog products={await getWebsiteProducts()} />;
}

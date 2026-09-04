import Link from "next/link";
import type { WebsiteProduct } from "@/lib/website";

export function ProductCatalog({ products }: { products: WebsiteProduct[] }) {
  return <section className="product-catalog">
    <div className="catalog-intro"><p className="eyebrow">Website Sale</p><h1>Khám phá sản phẩm</h1><p>Những sản phẩm và dịch vụ đang được cung cấp trên MetaFlow.</p></div>
    <div className="product-grid">
      {products.map((product) => <Link className="product-card" href={`/products/${product.slug}`} key={product.id}>
        <span className="product-code">{product.default_code || "PRODUCT"}</span>
        <h2>{product.name}</h2>
        <strong>{formatPrice(product.list_price)}</strong>
        <span className="product-link">Xem chi tiết</span>
      </Link>)}
    </div>
    {!products.length ? <p className="empty-products">Hiện chưa có sản phẩm đang hoạt động.</p> : null}
  </section>;
}

export function ProductDetail({ product }: { product: WebsiteProduct }) {
  return <main className="product-detail"><Link className="back-link" href="/products">← Quay lại sản phẩm</Link><p className="eyebrow">{product.default_code || "PRODUCT"}</p><h1>{product.name}</h1><p className="product-price">{formatPrice(product.list_price)}</p><p className="product-description">Sản phẩm thuộc danh mục được quản lý trong hệ thống MetaFlow.</p></main>;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getWebsitePage } from "@/lib/website";

export const metadata: Metadata = {
  title: "MetaFlow",
  description: "MetaFlow business suite"
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const data = await getWebsitePage("home");
  const menus = data?.menus ?? [];

  return (
    <html lang="vi">
      <body>
        <header className="site-header">
          <Link className="site-brand" href="/">MetaFlow</Link>
          <nav className="site-nav" aria-label="Main navigation">
            {menus.filter((menu) => menu.label && menu.url).map((menu) => (
              <Link key={`${menu.url}-${menu.label}`} href={menu.url!}>{menu.label}</Link>
            ))}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

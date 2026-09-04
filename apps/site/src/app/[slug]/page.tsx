import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebsitePageView } from "@/components/WebsitePageView";
import { getWebsitePage } from "@/lib/website";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 30;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getWebsitePage(slug);
  return data ? { title: data.page.title, description: data.page.meta_description ?? undefined } : { title: "Page not found" };
}

export default async function WebsitePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getWebsitePage(slug);
  if (!data) notFound();
  return <WebsitePageView title={data.page.title} content={data.page.content} />;
}

import { WebsitePageView } from "@/components/WebsitePageView";
import { getWebsitePage } from "@/lib/website";

export const revalidate = 30;

export default async function HomePage() {
  const data = await getWebsitePage("home");
  if (!data) return <WebsitePageView title="Page not found" content="<h1>Page not found</h1>" />;
  return <WebsitePageView title={data.page.title} content={data.page.content} />;
}

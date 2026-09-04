type WebsitePageViewProps = { title: string; content: string };

export function WebsitePageView({ title, content }: WebsitePageViewProps) {
  return <main className="site-main" aria-label={title}><div dangerouslySetInnerHTML={{ __html: content }} /></main>;
}

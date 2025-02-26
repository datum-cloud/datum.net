import { getPages } from "@/libs/contents"

const pages = getPages();

export default function ChangelogPage() {
  return (
    <div dangerouslySetInnerHTML={{ __html: pages.changelog.content }}></div>
  );
} 

export const metadata = {
  title: pages.changelog.title,
  description: pages.changelog.description,
  keywords: pages.changelog.keywords ?? [],
  openGraph: {
    title: pages.changelog.og?.title ?? pages.changelog.title,
    description: pages.changelog.og?.description ?? pages.changelog.description,
    site_name: 'Datum',
    url: 'https://datum.net',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg', // Must be an absolute URL
        width: 800,
        height: 600,
      },
    ],
    type: 'website',
  },
  twitter: {
    title: pages.changelog.twitter?.title ?? pages.changelog.title,
    description: pages.changelog.twitter?.description ?? pages.changelog.description,
    card: 'summary_large_image',
    images: ['https://cdn.prod.website-files.com/66dab18c1311fe77f4eb9370/66fcee96f9f4b328f7454f5a_Datum%20Opengraph.jpg'],
  },
};
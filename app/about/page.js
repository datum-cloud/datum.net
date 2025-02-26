import { getPages } from "@/libs/contents"

const pages = getPages();

export default function AboutPage() {
  return (
    <div dangerouslySetInnerHTML={{ __html: pages.about.content }}></div>
  );
}

export const metadata = {
  title: pages.about.title,
  description: pages.about.description,
  keywords: pages.about.keywords ?? [],
  openGraph: {
    title: pages.about.og?.title ?? pages.about.title,
    description: pages.about.og?.description ?? pages.about.description,
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
    title: pages.about.twitter?.title ?? pages.about.title,
    description: pages.about.twitter?.description ?? pages.about.description,
    card: 'summary_large_image',
    images: ['https://cdn.prod.website-files.com/66dab18c1311fe77f4eb9370/66fcee96f9f4b328f7454f5a_Datum%20Opengraph.jpg'],
  },
};
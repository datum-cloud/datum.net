import { getPages } from "@/libs/contents"

const pages = getPages();

export default function Home() {
  return (
    <main
      className="flex flex-col gap-8 row-start-2 items-center sm:items-start"
      dangerouslySetInnerHTML={{ __html: pages.home.content }}
    ></main>
  );
}

export const metadata = {
  title: pages.home.title,
  description: pages.home.description,
  keywords: pages.home.keywords ?? [],
  openGraph: {
    title: pages.home.og?.title ?? pages.home.title,
    description: pages.home.og?.description ?? pages.home.description,
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
    title: pages.home.twitter?.title ?? pages.home.title,
    description: pages.home.twitter?.description ?? pages.home.description,
    card: 'summary_large_image',
    images: ['https://cdn.prod.website-files.com/66dab18c1311fe77f4eb9370/66fcee96f9f4b328f7454f5a_Datum%20Opengraph.jpg'],
  },
};

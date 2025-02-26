import Link from 'next/link';
import { getPages, getChangelogs } from "@/libs/contents";

const pages = getPages();

export default function ChangelogPage() {
  const changelogs = getChangelogs();

  return (
    <div>
      <h1 className={'font-bold mb-2'}>{pages.changelog.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: pages.changelog.content }} className={'mb-8'}></div>

      <ol className={"relative border-s border-gray-200 dark:border-gray-700"}>
        { changelogs.map(changelog => (           
          <li className={"mb-10 ms-4"} key={changelog.slug}>
              <div className={"absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"}></div>
              <time className={"mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"}>{ changelog.date.toString() }</time>
              <h3 className={"text-lg font-semibold text-gray-900 dark:text-white"}>{ changelog.title }</h3>
              <p className={"mb-4 text-base font-normal text-gray-500 dark:text-gray-400"}>{ changelog.description }</p>
              <Link href={`/changelog/${changelog.slug}`} className={"inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"}>
                Learn more
                <svg className={"w-3 h-3 ms-2 rtl:rotate-180"} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                </svg>
              </Link>
          </li>
        )) }
      </ol>
    </div>
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
import Link from 'next/link';
import { getPages, getBlogs } from "@/libs/contents";

const pages = getPages();

export default function BlogPage() {
  const blogs = getBlogs();

  return (
    <div>
      <p dangerouslySetInnerHTML={{ __html: pages.blog.content }}></p>
      
      <div className="flex flex-wrap gap-4 mx-auto px-4 py-8">
        { blogs.map(blog => (
            <div key={blog.slug} className={"max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"}>
                <Link href={`/blog/${blog.slug}`}>
                    <h5 className={"mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"}>{ blog.title }</h5>
                </Link>
                <div className={"mb-3 font-normal text-gray-700 dark:text-gray-400"}>
                  <small>{ blog.date.toISOString().substr(0,10) }</small>
                  <p>{ blog.description }</p>
                </div>
                <Link href={`/blog/${blog.slug}`} className={"inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}>
                  Read more
                  <svg className={"rtl:rotate-180 w-3.5 h-3.5 ms-2"} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg>
                </Link>
            </div>
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: pages.blog.title,
  description: pages.blog.description,
  keywords: pages.blog.keywords ?? [],
  openGraph: {
    title: pages.blog.og?.title ?? pages.blog.title,
    description: pages.blog.og?.description ?? pages.blog.description,
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
    title: pages.blog.twitter?.title ?? pages.blog.title,
    description: pages.blog.twitter?.description ?? pages.blog.description,
    card: 'summary_large_image',
    images: ['https://cdn.prod.website-files.com/66dab18c1311fe77f4eb9370/66fcee96f9f4b328f7454f5a_Datum%20Opengraph.jpg'],
  },
};
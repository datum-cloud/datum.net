import { getBlogs } from "@/libs/contents";
import { notFound } from "next/navigation";

import markdownit from 'markdown-it';

// import Aside from "@/components/aside"

const md = markdownit();

export default async function BlogDetailPage ({ params }) {
  const param = await params;
  const blog = await fetchDetail(param);

  if (!blog) notFound();

  const HTMLcontent = md.render(blog.content);

  return (
    <div id="content">
      <h1>{ blog.title }</h1>
      <span className={'mb-4'}>{ blog.date.toString() }</span>

      <div className="flex flex-col lg:flex-row container mx-auto px-4 py-8">
        <div dangerouslySetInnerHTML={{__html: HTMLcontent}}></div>
      </div>
    </div>
  );
}

async function fetchDetail({ slug }) {
  const blogs = getBlogs();
  return blogs.find((blog) => blog.slug === slug);
}

export const metadata = {
  title: '',
  description: '',
  keywords: [],
  openGraph: {
    title: '',
    description: '',
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
    title: '',
    description: '',
    card: 'summary_large_image',
    images: ['https://cdn.prod.website-files.com/66dab18c1311fe77f4eb9370/66fcee96f9f4b328f7454f5a_Datum%20Opengraph.jpg'],
  },
};
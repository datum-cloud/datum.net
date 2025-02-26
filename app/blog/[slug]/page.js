import { getBlogs } from "@/libs/contents";
import { notFound } from "next/navigation";
import { Link } from "next/link"

import Image from 'next/image'
import markdownit from 'markdown-it';

import Aside from "@/components/aside"

const md = markdownit();


async function fetchDetail({ slug }) {
  const blogs = getBlogs();
  return blogs.find((blog) => blog.slug === slug);
}


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
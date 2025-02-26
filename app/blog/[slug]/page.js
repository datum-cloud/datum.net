import { getBlogs } from "@/libs/contents";
import { notFound } from "next/navigation";
import markdownit from 'markdown-it';

const md = markdownit();

async function fetchDetail(slug) {
    const blogs = getBlogs();
    return blogs.find((blog) => blog.slug === slug);
}

export default async function BlogDetailPage ({ params }) {
    const blog = await fetchDetail(params.slug);

    if (!blog) notFound();

    const HTMLcontent = md.render(blog.content);

    console.log(params);
    return (
        <div>
            <h1>{ blog.title }</h1>
            <span>{ blog.date.toString() }</span>
            <p dangerouslySetInnerHTML={{__html: HTMLcontent}}></p>
        </div>
    );
}
import { getChangelogs } from "@/libs/contents";
import { notFound } from "next/navigation";
import markdownit from 'markdown-it';

const md = markdownit();

export default async function ChangelogDetailPage ({ params }) {
    const param = await params;
    const changelog = await fetchDetail(param);

    if (!changelog) notFound();

    const HTMLcontent = md.render(changelog.content);

    return (
        <div id="content">
            <h1>{ changelog.title }</h1>
            <small>{ changelog.date.toString() }</small>
            <div dangerouslySetInnerHTML={{__html: HTMLcontent}} className={'mt-4'}></div>
        </div>
    );
}

async function fetchDetail({ slug }) {
    const changelogs = getChangelogs();
    return changelogs.find((changelog) => changelog.slug === slug);
}
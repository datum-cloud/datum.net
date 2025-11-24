import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getCollectionEntry } from '@utils/collectionUtils';

const index = await getCollectionEntry('pages', 'blog');

const title = index.data.title || index.data.meta.title;
const description = index.data.description || index.data.meta.description;

export async function GET(context) {
  const blogs = await getCollection('blog', ({ data }) => !data.draft);

  blogs.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: title,
    description: description,
    site: context.site,
    items: blogs.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  });
}

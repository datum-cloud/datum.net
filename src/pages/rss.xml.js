import rss from '@astrojs/rss';
import { fetchStrapiArticles } from '@libs/strapi';
import { getCollectionEntry } from '@utils/collectionUtils';

export async function GET(context) {
  const index = await getCollectionEntry('pages', 'blog');
  const title = index.data.title || index.data.meta?.title || 'Datum Blog';
  const description =
    index.data.description || index.data.meta?.description || 'Latest news from Datum';

  const strapiArticles = await fetchStrapiArticles();

  const sortedArticles = strapiArticles.sort((a, b) => {
    const dateA = a.originalPublishedAt ? new Date(a.originalPublishedAt).getTime() : 0;
    const dateB = b.originalPublishedAt ? new Date(b.originalPublishedAt).getTime() : 0;
    return dateB - dateA;
  });

  return rss({
    title: title,
    description: description,
    site: context.site,
    items: sortedArticles.map((article) => ({
      title: article.title,
      pubDate: article.originalPublishedAt ? new Date(article.originalPublishedAt) : new Date(),
      description: article.description,
      link: `/blog/${article.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}

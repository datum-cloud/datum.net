// Dynamic markdown export of /about. Reads the same sources the rendered
// page consumes, in the same order the page renders them:
//   - src/data/about.ts                  (AboutHero, FoundingInsight, ExploreCards copy)
//   - src/content/about/companies.mdx    (AboutHero — title + logo list)
//   - src/content/about/investors.mdx    (Investors — title + logo list)
//   - Strapi twins posts                 (TwinsInTheLoop — same source as the component)
// The team roster moved to /about/team (see about/team.md.ts). Any edit to
// those sources updates this endpoint on next request.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { fetchStrapiTwinsPosts } from '@libs/strapi/twinsPosts';
import { explore, foundingInsight, hero, twinsAuthorName, twinsInTheLoop } from '@data/about';
import { formatOrdinalDate } from '@utils/dateUtils';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

const listNames = (items: Array<{ alt?: string }> | undefined): string =>
  (items ?? [])
    .map((item) => item.alt)
    .filter(Boolean)
    .join(', ');

export const GET: APIRoute = async () => {
  try {
    const [companies, investors] = await Promise.all([
      getEntry('about', 'companies'),
      getEntry('about', 'investors'),
    ]);

    const sections: string[] = [
      `# ${hero.title.before}${hero.title.highlight}${hero.title.after}`.trim(),
      '',
      hero.lead.join(' ').replace(/\{\{|\}\}/g, ''),
      '',
    ];

    if (companies) {
      sections.push(`## ${companies.data.title}`, '');
      const names = listNames(companies.data.companies);
      if (names) sections.push(names, '');
    }

    sections.push(
      `## ${foundingInsight.eyebrow}`,
      '',
      ...foundingInsight.paragraphs.map((p) => `${p}\n`)
    );

    if (investors) {
      sections.push(`## ${investors.data.title}`, '');
      const names = listNames(investors.data.investors);
      if (names) sections.push(names, '');
    }

    for (const card of explore) {
      sections.push(
        `## ${card.title}`,
        '',
        card.description,
        '',
        `[${card.cta.text}](https://www.datum.net${card.cta.href})`,
        ''
      );
    }

    const posts = await fetchStrapiTwinsPosts();
    if (posts.length) {
      sections.push(`## ${twinsInTheLoop.title}`, '', twinsInTheLoop.description, '');
      for (const post of posts) {
        const author = twinsAuthorName(post.author);
        const byline = [author, formatOrdinalDate(post.published)].filter(Boolean).join(', ');
        sections.push(`- ${post.title} (${byline})`);
      }
      sections.push('');
    }

    const canonicalUrl = 'https://www.datum.net/about';
    sections.push('---', '', `Source: <${canonicalUrl}>`, '');

    const body = toAsciiMarkdown(sections.join('\n'));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error('Failed to serve /about.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

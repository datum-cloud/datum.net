// Dynamic markdown export of /about. Reads the same sources the rendered
// page consumes, in the same order the page renders them:
//   - src/content/about/our-mission.mdx  (OurMission — hero title + body)
//   - src/content/about/companies.mdx    (Companies — title + logo list)
//   - Strapi team members                (PeopleStrapi — same source as the component)
//   - src/content/about/investors.mdx    (Investors — title + logo list)
// Any edit to those files, or a team-member change in Strapi, updates this
// endpoint on next request.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { getStrapiTeamMembers } from '@libs/strapi';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

function stripHtml(input: string): string {
  return input.replace(/<\/?[^>]+>/g, '').trim();
}

export const GET: APIRoute = async () => {
  try {
    const [indexEntry, mission, companies, investors] = await Promise.all([
      getEntry('about', 'index'),
      getEntry('about', 'our-mission'),
      getEntry('about', 'companies'),
      getEntry('about', 'investors'),
    ]);

    const sections: string[] = [
      `# ${indexEntry?.data.title ?? mission?.data.title ?? 'About Datum'}`,
      '',
    ];

    if (mission?.body) sections.push(stripHtml(mission.body).trim(), '');

    if (companies) {
      const names = (companies.data.companies ?? []) as Array<{ alt?: string }>;
      sections.push(`## ${companies.data.title}`, '');
      if (names.length)
        sections.push(
          names
            .map((c) => c.alt)
            .filter(Boolean)
            .join(', '),
          ''
        );
    }

    const teamMembers = await getStrapiTeamMembers();
    if (teamMembers.length) {
      sections.push('## Meet the people behind Datum', '');
      for (const member of teamMembers) {
        const title = member.title ? ` - ${member.title}` : '';
        sections.push(`- ${member.name}${title}`);
      }
      sections.push('');
    }

    if (investors) {
      const names = (investors.data.investors ?? []) as Array<{ alt?: string }>;
      sections.push(`## ${investors.data.title}`, '');
      if (names.length)
        sections.push(
          names
            .map((i) => i.alt)
            .filter(Boolean)
            .join(', '),
          ''
        );
    }

    const canonicalUrl = 'https://www.datum.net/about/';
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

// Dynamic markdown export of /about/team. Reads the same sources the rendered
// page consumes:
//   - src/data/about.ts   (header copy)
//   - Strapi team members (TeamGrid — same source as the component)
// A team-member change in Strapi updates this endpoint on next request.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getStrapiTeamMembers } from '@libs/strapi';
import { team, teamDescription } from '@data/about';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

export const GET: APIRoute = async () => {
  try {
    const sections: string[] = [`# ${team.title}`, '', teamDescription, ''];

    const teamMembers = await getStrapiTeamMembers();
    if (teamMembers.length) {
      for (const member of teamMembers) {
        const title = member.title ? ` - ${member.title}` : '';
        sections.push(`- ${member.name}${title}`);
      }
      sections.push('');
    }

    const canonicalUrl = 'https://www.datum.net/about/team';
    sections.push('---', '', `Source: <${canonicalUrl}>`, '');

    return new Response(toAsciiMarkdown(sections.join('\n')), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error('Failed to serve /about/team.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

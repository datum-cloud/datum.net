// Dynamic markdown export of /use-cases. Reads the same source the rendered
// page consumes: src/data/useCases.ts. Shared with use-cases.astro so the two
// can't drift out of sync.
export const prerender = false;

import type { APIRoute } from 'astro';
import { hero, agents, obstacles, help } from '@data/useCases';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

export const GET: APIRoute = async () => {
  try {
    const sections: string[] = [`# ${hero.title} ${hero.titleHighlight}`, ''];

    for (const item of hero.items) {
      sections.push(`- **${item.title}** - ${item.description}`);
    }
    sections.push('', agents.caption, '');

    sections.push(`## ${obstacles.title}`, '');
    for (const item of obstacles.items) {
      sections.push(`### ${item.label}`, '', `**${item.title}**`, '', item.description, '');
    }

    sections.push(`## ${help.title}`, '', help.description, '');
    sections.push(
      `- [${help.primaryCta.text}](${help.primaryCta.href})`,
      `- [${help.secondaryCta.text}](${help.secondaryCta.href})`,
      ''
    );

    const canonicalUrl = 'https://www.datum.net/use-cases';
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
    console.error('Failed to serve /use-cases.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

// Dynamic markdown export of /platform/dns. Reads the same source the rendered
// page consumes: src/data/dns.ts. Shared with platform/dns.astro so the two
// can't drift out of sync.
export const prerender = false;

import type { APIRoute } from 'astro';
import { hero, capabilities, operations, comparison, domains } from '@data/dns';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

export const GET: APIRoute = async () => {
  try {
    const sections: string[] = [`# ${hero.title}`, '', hero.description, ''];

    sections.push(`## ${capabilities.title}`, '');
    for (const item of capabilities.items) {
      sections.push(`- **${item.title}** - ${item.description}`);
    }
    sections.push('');

    sections.push(`## ${operations.title}`, '');
    for (const item of operations.items) {
      sections.push(`- **${item.title}** - ${item.description}`);
    }
    sections.push('');

    sections.push(`## ${comparison.title}`, '', comparison.description, '');
    sections.push(
      `| | ${comparison.datumLabel} | ${comparison.cloudflareLabel} |`,
      '| --- | --- | --- |'
    );
    for (const row of comparison.rows) {
      sections.push(`| ${row.label} | ${row.datum} | ${row.cloudflare} |`);
    }
    sections.push('');

    sections.push(`## ${domains.title}`, '', domains.description, '');
    domains.steps.forEach((step, index) => {
      sections.push(`${index + 1}. **${step.title}** - ${step.description}`);
    });
    sections.push('');

    const canonicalUrl = 'https://www.datum.net/platform/dns';
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
    console.error('Failed to serve /platform/dns.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

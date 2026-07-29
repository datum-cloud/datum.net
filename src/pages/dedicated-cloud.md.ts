// Dynamic markdown export of /dedicated-cloud. Reads the same source the
// rendered page consumes: src/data/dedicatedCloud.ts. Shared with
// dedicated-cloud.astro so the two can't drift out of sync.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { hero, builtForYou, whyDatum, operators, contact } from '@data/dedicatedCloud';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

export const GET: APIRoute = async () => {
  try {
    const faqs = (await getCollection('faq'))
      .filter((faq) => !faq.data.draft && faq.data.category === 'dedicated-cloud')
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

    const sections: string[] = [`# ${hero.title}`, '', hero.description, ''];

    sections.push(`## ${builtForYou.title}`, '', ...builtForYou.intro, '');
    for (const item of builtForYou.items) {
      sections.push(`- **${item.title}** - ${item.description}`);
    }
    sections.push('');

    sections.push(`## ${whyDatum.title}`, '');
    for (const item of whyDatum.items) {
      sections.push(`- **${item.title}** - ${item.description}`);
    }
    sections.push('');

    sections.push("## We're operators at heart", '');
    for (const person of operators.items) {
      sections.push(`- **${person.name}, ${person.role}** - ${person.bio}`);
    }
    sections.push('');

    sections.push(`## ${contact.title}`, '', contact.description, '');

    if (faqs.length > 0) {
      sections.push('## Frequently asked questions', '');
      for (const faq of faqs) {
        sections.push(`- ${faq.data.question}`);
      }
      sections.push('');
    }

    const canonicalUrl = 'https://www.datum.net/dedicated-cloud';
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
    console.error('Failed to serve /dedicated-cloud.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

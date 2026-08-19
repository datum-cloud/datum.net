// Dynamic markdown export of /pricing. Reads the same sources the rendered
// page consumes:
//   - src/content/pages/pricing.mdx          (title + intro)
//   - src/data/pricing.ts                    (rate card)
//   - src/content/faq/*.mdx category=pricing (FAQ section)
// Any edit to those files updates this endpoint on next request.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';
import { faqToMarkdown } from '@utils/faqText';
import { callout, faqTitle, rates, type RateGroup, type RateRow } from '@data/pricing';

/** Flattens a price cell to the same string the table renders. */
function renderPrice(row: RateRow): string {
  if (row.free) return 'FREE';
  if (row.link) return row.link.text;

  return (row.lines ?? [])
    .map((line) => `$${line.amount}${line.suffix ?? ''}${line.note ? ` ${line.note}` : ''}`)
    .join('; ');
}

function renderGroup(group: RateGroup): string[] {
  const lines: string[] = [`### ${group.name}`, ''];

  if (group.note) lines.push(`_${group.note.text}_`, '');

  lines.push('| Feature | Unit of measure | Price per unit |', '| --- | --- | --- |');

  for (const feature of group.features) {
    const label = feature.badge ? `${feature.name} (${feature.badge})` : feature.name;
    for (const row of feature.rows) {
      lines.push(`| ${label} | ${row.unit} | ${renderPrice(row)} |`);
    }
  }

  return lines;
}

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'pricing');

    const faqs = (await getCollection('faq'))
      .filter((f) => !f.data.draft && f.data.category === 'pricing')
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

    const sections: string[] = [`# ${page?.data.title ?? 'Datum Pricing'}`, ''];

    if (page?.data.description) {
      sections.push(page.data.description, '');
    }

    sections.push(`## ${callout.title}`, '', callout.description, '');
    for (const item of callout.items) {
      sections.push(`- ${item}`);
    }
    sections.push('');

    sections.push('## Rates');
    for (const group of rates.groups) {
      sections.push('', ...renderGroup(group));
    }
    sections.push('');

    if (faqs.length > 0) {
      sections.push('', `## ${faqTitle}`);
      for (const faq of faqs) {
        sections.push('', `### ${faq.data.question}`, '', faqToMarkdown(faq.body ?? ''));
      }
    }

    const canonicalUrl = 'https://www.datum.net/pricing';
    sections.push('', '---', '', `Source: <${canonicalUrl}>`, '');

    const body = toAsciiMarkdown(sections.join('\n'));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error('Failed to serve /pricing.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

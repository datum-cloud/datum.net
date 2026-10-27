// Dynamic markdown export of /pricing. Reads the same sources the rendered
// page consumes:
//   - src/content/pages/pricing.mdx          (title + intro)
//   - src/data/pricing.ts                    (hero, banner, rate cards, batteries)
//   - src/content/faq/*.mdx category=pricing (FAQ section)
// Any edit to those files updates this endpoint on next request.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';
import { faqToMarkdown } from '@utils/faqText';
import {
  banner,
  batteries,
  faqTitle,
  hero,
  rates,
  type RateCard,
  type RateCardDescription,
  type RateRow,
} from '@data/pricing';

/** Flattens a price cell to the same string the table renders. */
function renderPrice(row: RateRow): string {
  if (row.free) return row.free.toUpperCase();
  if (row.link) return row.link.text;

  return (row.lines ?? [])
    .map((line) => `$${line.amount}${line.suffix ?? ''}${line.note ? ` ${line.note}` : ''}`)
    .join('; ');
}

/** Flattens a card description, keeping inline links as markdown links. */
function renderDescription(description: RateCardDescription): string {
  return description
    .map((part) => (typeof part === 'string' ? part : `[${part.text}](${part.href})`))
    .join('');
}

function renderCard(card: RateCard): string[] {
  const lines: string[] = [
    `### ${card.title}`,
    '',
    renderDescription(card.description),
    '',
    `| ${rates.columns.join(' | ')} |`,
    '| --- | --- | --- |',
  ];

  for (const feature of card.features) {
    const label = feature.badge ? `${feature.name} (${feature.badge})` : feature.name;
    for (const row of feature.rows) {
      lines.push(`| ${label} | ${row.unit || '—'} | ${renderPrice(row)} |`);
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

    sections.push(hero.description, '');
    for (const item of hero.highlights) {
      sections.push(`- [${item.name}](${item.href}): ${item.info}`);
    }
    sections.push('', `**${banner.emphasis}** ${banner.text}`, '');

    sections.push('## Rates');
    for (const card of rates.cards) {
      sections.push('', ...renderCard(card));
    }
    sections.push('');

    sections.push(`## ${batteries.title}`, '', batteries.description, '');
    sections.push(`_${batteries.label}_`, '');
    for (const item of batteries.columns.flat()) {
      sections.push(`- [${item.name}](${item.href}): ${item.info}`);
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

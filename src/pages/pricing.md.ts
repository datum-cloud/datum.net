// Dynamic markdown export of /pricing. Reads the same sources the rendered
// page consumes:
//   - src/content/pages/pricing.mdx     (title + intro)
//   - src/content/pricing/*.json        (tier cards)
//   - src/content/faq/*.mdx category=pricing  (FAQ section)
// Any edit to those files updates this endpoint on next request.
import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { toAsciiMarkdown } from '@utils/markdownExport';

interface PricingTier {
  title: string;
  subtitle?: string;
  description?: string;
  order?: number;
  price?: { amount?: string; suffix?: string };
  cta?: { label?: string; href?: string };
  featureGroups?: Array<{ title?: string; items?: string[] }>;
}

function renderTier(tier: PricingTier): string {
  const price = tier.price?.amount ?? '';
  const suffix = tier.price?.suffix?.trim() ?? '';
  const heading = price
    ? `### ${tier.title} - ${price}${suffix ? ' ' + suffix : ''}`
    : `### ${tier.title}`;
  const lines: string[] = [heading];

  if (tier.subtitle || tier.description) {
    const sub = tier.subtitle ? `**${tier.subtitle}.** ` : '';
    lines.push('', `${sub}${tier.description ?? ''}`.trim());
  }

  for (const group of tier.featureGroups ?? []) {
    if (group.title) lines.push('', group.title);
    for (const item of group.items ?? []) {
      lines.push(`- ${item}`);
    }
  }

  if (tier.cta?.label && tier.cta?.href && tier.cta.href !== '#') {
    lines.push('', `[${tier.cta.label}](${tier.cta.href})`);
  } else if (tier.cta?.label) {
    lines.push('', `_${tier.cta.label}_`);
  }

  return lines.join('\n');
}

function stripFaqBody(body: string): string {
  // Strip MDX import lines and component tags. FAQ bodies are simple
  // prose today, but this guards against future MDX edits.
  return body
    .replace(/^import\s+.*$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'pricing');
    const tiers = (await getCollection('pricing'))
      .map((entry) => entry.data as PricingTier)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const faqs = (await getCollection('faq'))
      .filter((f) => !f.data.draft && f.data.category === 'pricing')
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

    const sections: string[] = [`# ${page?.data.title ?? 'Datum Pricing'}`, ''];

    if (page?.data.subtitle) {
      sections.push(page.data.subtitle, '');
    }
    if (page?.data.description) {
      sections.push(page.data.description, '');
    }
    if (page?.data.meta?.description) {
      sections.push(page.data.meta.description, '');
    }

    sections.push('## Plans');
    for (const tier of tiers) {
      sections.push('', renderTier(tier));
    }

    if (faqs.length > 0) {
      sections.push('', '## Common Questions');
      for (const faq of faqs) {
        sections.push('', `### ${faq.data.question}`, '', stripFaqBody(faq.body ?? ''));
      }
    }

    sections.push('', '---', '', 'Source: <https://www.datum.net/pricing/>', '');

    const body = toAsciiMarkdown(sections.join('\n'));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Failed to serve /pricing.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

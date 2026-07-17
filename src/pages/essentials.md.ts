// Dynamic markdown export of /essentials. Reads the same sources the
// rendered page consumes:
//   - src/content/pages/essentials.mdx (title + body)
//   - src/data/features.json           (feature grid)
//   - src/content/faq/*.mdx category=features (FAQ section)
// Any edit to those files updates this endpoint on next request.
import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import features from '@data/features.json';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders, stripMdxToMarkdown } from '@utils/pageMarkdown';

interface Feature {
  title: string;
  description: string;
}

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'essentials');
    const fm = page?.data;

    const faqs = (await getCollection('faq'))
      .filter((faq) => !faq.data.draft && faq.data.category === 'features')
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

    const sections: string[] = [`# ${fm?.title ?? 'Datum Essentials'}`, ''];
    if (fm?.description) sections.push(fm.description, '');
    if (page?.body) sections.push(stripMdxToMarkdown(page.body), '');

    sections.push('## Core Essentials', '');
    for (const feature of features as Feature[]) {
      sections.push(`- **${feature.title}** - ${feature.description}`);
    }

    if (faqs.length) {
      sections.push('', '## Frequently asked questions');
      for (const faq of faqs) {
        sections.push('', `### ${faq.data.question}`, '', stripMdxToMarkdown(faq.body ?? ''));
      }
    }

    const canonicalUrl = 'https://www.datum.net/essentials/';
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
    console.error('Failed to serve /essentials.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

// Markdown export of /platform. Reads src/data/platform.ts, the same source
// platform/index.astro renders, so the two can't drift.

import type { APIRoute } from 'astro';
import { backboneStops, features, galactic, hero, prefooter } from '@data/platform';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

export const GET: APIRoute = async () => {
  try {
    const sections: string[] = [`# ${hero.title}`, '', hero.description, ''];

    sections.push(`[${hero.cta.text}](${hero.cta.href})`, '', hero.footnote, '');
    sections.push('Galactic VPC connects:', '');
    for (const stop of backboneStops) {
      sections.push(`- ${stop.lines.join(' ')}`);
    }
    sections.push('');

    sections.push(
      `## ${galactic.titleLead} ${galactic.titleAccent}`,
      '',
      galactic.description.join(' '),
      ''
    );
    for (const list of galactic.lists) {
      sections.push(`### ${list.title}`, '');
      for (const item of list.items) {
        const soon = item.soon ? ' (soon)' : '';
        const description = item.description ? ` - ${item.description}` : '';
        sections.push(`- **${item.title}**${soon}${description}`);
      }
      sections.push('');
    }
    sections.push(
      `${galactic.docs.text}: [${galactic.docs.cta.text}](${galactic.docs.cta.href})`,
      ''
    );

    sections.push(`## ${features.title}`, '', features.description, '');
    for (const item of features.items) {
      sections.push(`- **${item.title}** - ${item.description}`);
    }
    sections.push('');

    sections.push(
      `## ${prefooter.titleLead} ${prefooter.titleAccent} ${prefooter.title} ${prefooter.titleTail}`,
      '',
      prefooter.description,
      ''
    );
    for (const button of prefooter.buttons) {
      sections.push(`- [${button.text}](${button.href})`);
    }
    sections.push('');

    const canonicalUrl = 'https://www.datum.net/platform';
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
    console.error('Failed to serve /platform.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

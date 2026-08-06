// Dynamic markdown export of /platform/compute. Reads the same source the
// rendered page consumes: src/data/compute.ts. Shared with platform/compute.astro
// so the two can't drift out of sync.
export const prerender = false;

import type { APIRoute } from 'astro';
import { hero, performance, useCases, features } from '@data/compute';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

export const GET: APIRoute = async () => {
  try {
    const sections: string[] = [`# ${hero.title}`, '', hero.description, ''];

    sections.push(`## ${performance.title}`, '', performance.description, '');
    for (const point of performance.points) {
      sections.push(`- ${point}`);
    }
    sections.push('');

    sections.push(`### ${performance.chart.title}`, '');
    sections.push('| | Cold start |', '| --- | --- |');
    for (const bar of performance.chart.bars) {
      sections.push(`| ${bar.label} | ${bar.value} |`);
    }
    sections.push('', performance.chart.caption, '');

    sections.push(`## ${useCases.title}`, '', useCases.description, '');
    for (const item of useCases.items) {
      sections.push(`### ${item.title}`, '', item.description, '');
      for (const point of item.points) {
        sections.push(`- ${point}`);
      }
      sections.push('');
    }

    sections.push(`## ${features.title}`, '');
    for (const item of features.items) {
      sections.push(`### ${item.title}`, '', item.description, '');
      item.steps.forEach((step, index) => {
        sections.push(`${index + 1}. ${step}`);
      });
      sections.push('');
      if (item.note) {
        sections.push(item.note, '');
      }
    }

    const canonicalUrl = 'https://www.datum.net/platform/compute';
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
    console.error('Failed to serve /platform/compute.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { renderEntryMarkdown } from '@utils/pageMarkdown';

interface HandbookSection {
  slug: string;
  label?: string;
}

export const GET: APIRoute = async () => {
  try {
    const index = await getEntry('handbooks', 'index').catch(() => null);
    const data = (index?.data ?? {}) as { title?: string; contents?: HandbookSection[] };

    const sections: string[] = [];
    if (Array.isArray(data.contents) && data.contents.length > 0) {
      sections.push('## Sections', '');
      for (const s of data.contents) {
        const label = s.label ?? s.slug;
        sections.push(`- [${label}](/handbook/${s.slug}/)`);
      }
    }

    const body = renderEntryMarkdown(index ?? { data: { title: 'Handbook' } }, {
      trailingSections: sections.length ? [sections.join('\n')] : [],
      sourceUrl: 'https://www.datum.net/handbook/',
    });
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Failed to serve /handbook.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

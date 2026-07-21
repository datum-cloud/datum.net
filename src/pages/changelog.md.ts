import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { markdownSeoHeaders, renderEntryMarkdown, stripMdxToMarkdown } from '@utils/pageMarkdown';

interface ChangelogEntry {
  data: { title?: string; description?: string; date?: string | Date };
  body?: string;
  id: string;
}

function formatDate(d?: string | Date): string {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt.getTime())) return typeof d === 'string' ? d : '';
  return dt.toISOString().slice(0, 10);
}

export const GET: APIRoute = async () => {
  try {
    const index = await getEntry('changelog', 'index');
    const allEntries = (await getCollection('changelog')) as unknown as ChangelogEntry[];
    const entries = allEntries
      .filter((e) => e.id !== 'index')
      .sort((a, b) => {
        const da = a.data.date ? new Date(a.data.date).getTime() : 0;
        const db = b.data.date ? new Date(b.data.date).getTime() : 0;
        return db - da;
      });

    const sections: string[] = [];
    for (const entry of entries) {
      const date = formatDate(entry.data.date);
      const heading = date ? `## ${entry.data.title} - ${date}` : `## ${entry.data.title}`;
      sections.push(heading);
      if (entry.data.description) sections.push('', `_${entry.data.description}_`);
      const body = stripMdxToMarkdown(entry.body ?? '');
      if (body) sections.push('', body);
      sections.push('');
    }

    const canonicalUrl = 'https://www.datum.net/changelog';
    const body = renderEntryMarkdown(index ?? { data: { title: 'Changelog' } }, {
      trailingSections: sections.length ? [sections.join('\n').trim()] : [],
      sourceUrl: canonicalUrl,
    });
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error('Failed to serve /changelog.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

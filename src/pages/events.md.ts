import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { markdownSeoHeaders, renderEntryMarkdown } from '@utils/pageMarkdown';

interface EventEntry {
  id: string;
  data: {
    title?: string;
    description?: string;
    date?: string | Date;
    location?: string;
    url?: string;
    series?: string;
  };
}

function formatDate(d?: string | Date): string {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10);
}

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'events');
    const events = (await getCollection('events').catch(() => [])) as unknown as EventEntry[];

    const now = Date.now();
    const dated = events.map((e) => ({
      e,
      t: e.data.date ? new Date(e.data.date).getTime() : 0,
    }));
    const upcoming = dated.filter((d) => d.t && d.t >= now).sort((a, b) => a.t - b.t);
    const past = dated.filter((d) => !d.t || d.t < now).sort((a, b) => b.t - a.t);

    function renderList(items: typeof dated): string[] {
      const out: string[] = [];
      for (const { e } of items) {
        const date = formatDate(e.data.date);
        const title = e.data.title ?? e.id;
        const url = e.data.url ?? `/events/${e.id}`;
        const loc = e.data.location ? ` - ${e.data.location}` : '';
        const datePart = date ? `${date} - ` : '';
        out.push(`- ${datePart}[${title}](${url})${loc}`);
      }
      return out;
    }

    const sections: string[] = [];
    if (upcoming.length) {
      sections.push('## Upcoming events', '', ...renderList(upcoming), '');
    }
    if (past.length) {
      sections.push('## Past events', '', ...renderList(past.slice(0, 20)), '');
    }

    sections.push(
      '## Event series',
      '',
      '- [Monthly Community Huddles](/events/community-huddles/)',
      '- [Alt Cloud Meetups](/events/alt-cloud-meetups/)'
    );

    const canonicalUrl = 'https://www.datum.net/events';
    const body = renderEntryMarkdown(page ?? { data: { title: 'Events' } }, {
      trailingSections: [sections.join('\n')],
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
    console.error('Failed to serve /events.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

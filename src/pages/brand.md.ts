import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { renderEntryMarkdown } from '@utils/pageMarkdown';

interface BrandSection {
  id: string;
  data: { title?: string; description?: string };
}

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'brand').catch(() => null);
    const all = (await getCollection('pages')) as unknown as BrandSection[];
    const sections = all
      .filter((e) => e.id.startsWith('brand/') && e.id !== 'brand/index')
      .sort((a, b) => a.id.localeCompare(b.id));

    const list: string[] = ['## Sections', ''];
    for (const s of sections) {
      const slug = s.id.replace(/^brand\//, '');
      const desc = s.data.description ? ` - ${s.data.description}` : '';
      list.push(`- [${s.data.title ?? slug}](/brand/${slug}/)${desc}`);
    }

    const body = renderEntryMarkdown(page ?? { data: { title: 'Brand' } }, {
      skipBody: true,
      trailingSections: sections.length ? [list.join('\n')] : [],
      sourceUrl: 'https://www.datum.net/brand/',
    });
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Failed to serve /brand.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

// Dynamic markdown export of /locations. Pulls from src/data/locations.json
// so newly added regions appear in the markdown without manual edits.
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import locations from '@data/locations.json';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

interface Location {
  regionCode: string;
  metro: string;
  group: string;
}

// Display order for region groups, matching the rendered /locations page.
const GROUP_ORDER = ['NA', 'LATAM', 'EU', 'MEA', 'APAC'] as const;

const GROUP_HEADINGS: Record<string, string> = {
  NA: 'North America (NA)',
  LATAM: 'Latin America (LATAM)',
  EU: 'Europe (EU)',
  MEA: 'Middle East & Africa (MEA)',
  APAC: 'Asia Pacific (APAC)',
};

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'locations');
    const all = locations as Location[];

    // Group by region. Unknown groups go to the end alphabetically.
    const byGroup = new Map<string, Location[]>();
    for (const loc of all) {
      const arr = byGroup.get(loc.group) ?? [];
      arr.push(loc);
      byGroup.set(loc.group, arr);
    }

    const orderedGroups = [
      ...GROUP_ORDER.filter((g) => byGroup.has(g)),
      ...Array.from(byGroup.keys())
        .filter((g) => !GROUP_ORDER.includes(g as (typeof GROUP_ORDER)[number]))
        .sort(),
    ];

    const sections: string[] = [
      `# ${page?.data.title ?? 'Network Locations'}`,
      '',
      'Located where it matters most.',
    ];

    // Prefer the longer, more descriptive meta.description over the page's
    // short subtitle. The MDX body is empty for this page.
    const lede =
      page?.data.meta?.description ??
      page?.data.description ??
      "Datum's network is deployed at major internet peering points for low-latency access to public clouds, AI clouds, and end users.";
    sections.push('', lede);

    for (const group of orderedGroups) {
      const heading = GROUP_HEADINGS[group] ?? group;
      sections.push('', `## ${heading}`, '');
      const items = byGroup.get(group) ?? [];
      for (const loc of items) {
        sections.push(`- ${loc.metro} (${loc.regionCode})`);
      }
    }

    const canonicalUrl = 'https://www.datum.net/locations';
    sections.push(
      '',
      '## Why these cities',
      '',
      'The world is big, but the internet gathers in a smaller set of key "football cities" - Amsterdam, Ashburn, Tokyo, and a handful of others - where major providers interconnect and exchange traffic. Datum is deployed where the internet actually lives, which means lower latency for your users and shorter, cheaper paths to AWS, GCP, Azure, and the major AI clouds.',
      '',
      '---',
      '',
      `Source: <${canonicalUrl}>`,
      ''
    );

    const body = toAsciiMarkdown(sections.join('\n'));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error('Failed to serve /locations.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

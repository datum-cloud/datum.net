// Dynamic markdown export of / (home). Reads the same sources the rendered
// page consumes:
//   - src/content/pages/home.mdx        (hero title + description)
//   - src/components/home/*.astro       (section copy — component-composed,
//     no content-collection backing, so these sections are transcribed by
//     hand and need a manual update if that copy changes)
// Any edit to home.mdx updates the hero section here on next request.
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

/** Strip inline HTML tags (e.g. `<br>`, `<span class="...">`) from frontmatter title/description. */
function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', '/');
    const title = page?.data.title ? stripHtml(page.data.title) : 'Datum';
    const description = page?.data.description ? stripHtml(page.data.description) : '';

    const sections: string[] = [`# ${title}`, ''];
    if (description) sections.push(description, '');

    sections.push(
      '## What is Datum?',
      '',
      "The internet wasn't designed for AI and agents. We're on a mission to fix that.",
      '',
      "In the future we're building, intelligence is private by default, platforms can scale anywhere, and companies don't have to choose between velocity and control.",
      '',
      "To make all of that possible, we've built a network cloud designed specifically for AI and alt clouds, backed by open source. We combine powerful primitives, global reach, and a neutral strategy with powerful infrastructure in both multi-tenant and dedicated flavors.",
      '',
      '## The Datum Platform',
      '',
      'A modern edge cloud, backed by open source. Why use picks and shovels when you need bulldozers and backhoes?',
      '',
      '**A virtual backbone that goes everywhere. Yes, please!** Our platform helps agents and builders run workloads at the edge and securely connect everything from doorbells to databases. Isolated agentic sandboxes? Global load balancing? Cloud interconnects to AWS or GCP? Datum offers a consistent runtime that is lovingly designed for Kubernetes platform engineers and AI builders.',
      '',
      '- **Deliver** - Bring traffic into your world and meet the internet with confidence using our Layer7 load balancers and global DNS.',
      '- **Build** - Push intelligence to the edge with microVM compute, object storage, and a marketplace of partner solutions.',
      '- **Connect** - Bring in traffic with our "dial by key, not by IP" zero trust tunnels and aggregate connections with Galactic VPC.',
      '- **Essentials** - Our modern CLI and terminal give you scalable constructs for authorization, billing accounts, and more.',
      '',
      '## Dedicated cloud',
      '',
      'Single-tenant GPU, CPU, and network infrastructure. A different kind of cloud - built around you.',
      '',
      'For scaling providers and enterprises who benefit from full control, custom locations, and ideal economics. Leverage our expertise around:',
      '',
      '- Physical infrastructure',
      '- Data center supply chain',
      '- Network design & implementation',
      '',
      '[Learn more about Dedicated](/dedicated-cloud/)',
      '',
      '## Explore',
      '',
      '- [Platform](/platform/) - Galactic VPC, Datum Compute, DNS, connectors, and essentials',
      '- [Pricing](/pricing/) - Free during public beta, usage-based rates after',
      '- [Locations](/locations/) - 17+ global regions across NA, LATAM, EU, MEA, APAC',
      "- [Roadmap](/roadmap/) - What we're shipping next",
      '- [About](/about/) - Mission, team, and investors',
      '- [Blog](/blog/) - Product updates and engineering deep-dives',
      '- [Contact](/contact/) - Talk to a founder',
      '',
      '## For agents and developers',
      '',
      '- [Documentation](/docs/) - Quickstart and API reference',
      '- [Download datumctl](/download/datumctl/) - CLI for managing your network cloud',
      '- [Download Datum MCP](/download/datum-mcp/) - MCP server for AI tools',
      '- [GitHub](https://github.com/datum-cloud) - Open source under AGPLv3',
      ''
    );

    const canonicalUrl = 'https://www.datum.net/';
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
    console.error('Failed to serve /index.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

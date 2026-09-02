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
      "We're a venture-backed infrastructure startup upgrading the internet for a world disrupted by AI.",
      '',
      'We think every tech-forward company will move intelligence to the edge, keep workloads off the public internet, and curate with whom and how they connect.',
      '',
      'We make that possible with a modern edge cloud platform and dedicated infrastructure services.',
      '',
      '## The Datum Platform',
      '',
      'A modern edge cloud, backed by open source. Why use picks and shovels when you need bulldozers and backhoes?',
      '',
      '**Private, protected, performant.** Our platform helps developers run workloads at the network edge and securely connect everything from doorbells to databases. Isolated agentic sandboxes? Global load balancing? Cloud interconnects to AWS or GCP? Datum offers a consistent runtime that is lovingly designed for Kubernetes platform engineers and AI builders.',
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
      '- [Features](/features/) - AI Edge, Connectors, Galactic VPC, Datum Compute, foundations',
      '- [Essentials](/essentials/) - Enterprise-grade primitives included free',
      '- [Pricing](/pricing/) - Builder ($0), Scaler ($20/mo + usage), Provider (custom)',
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

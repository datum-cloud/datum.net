import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from 'astro:config/client';
import { extractDescription, buildUrl, stripHtml } from '@utils/llmsUtils';

// Note: handbook entries intentionally excluded — internal company ops content
// is not relevant to AI agents consuming platform documentation.

// The `features/<hub>/*` pages entries back the /platform/<hub> hub pages
// (src/pages/platform/{deliver,build,connect}.astro) — each hub composes an
// `index` entry plus several sub-feature entries into one route with anchor
// sections, so `buildUrl(page.id)` (which assumes one entry = one URL) would
// otherwise point at dead `/features/<hub>/...` URLs. Override with the real
// hub URL, anchored to the matching FeatureSection id for sub-features.
const PLATFORM_HUB_URL_OVERRIDES: Record<string, string> = {
  'features/deliver/index': '/platform/deliver',
  'features/deliver/dns': '/platform/deliver#dns',
  'features/deliver/application-load-balancer': '/platform/deliver#application-load-balancer',
  'features/deliver/global-load-balancer': '/platform/deliver#global-load-balancer',
  'features/build/index': '/platform/build',
  'features/build/compute': '/platform/build#compute',
  'features/build/object-storage': '/platform/build#object-storage',
  'features/build/edge-apps': '/platform/build#edge-apps',
  'features/connect/index': '/platform/connect',
  'features/connect/galactic-vpc': '/platform/connect#galactic-vpc',
  'features/connect/connectors': '/platform/connect#connectors',
  'features/connect/interconnect': '/platform/connect#interconnect',
};

export const GET: APIRoute = async () => {
  try {
    // Get project info
    const siteUrl = site;

    // Base structure for llms.txt
    let llmsContent = `# Datum\n\n`;
    llmsContent += `## About\n\n`;
    llmsContent += `> Datum is an open source network cloud for AI, founded in 2024 and backed by $13.6M from Amplify Partners, CRV, Encoded Ventures, Cervin Ventures, Ex/Ante, Step Function, and Vine Ventures. Built for AI-native developers and alternative cloud providers, Datum provides an Envoy-based AI Edge across 17+ global regions, QUIC-based secure tunnels (Connectors), authoritative DNS, and programmatic domain management — all with a forever-free Builder tier. Core platform licensed AGPLv3. Founded by Zac Smith (ex-Equinix, Packet) and Jacob Smith.\n\n`;

    // Get all pages sorted, excluding home/* pages
    const pages = await getCollection('pages');
    const filteredPages = pages.filter((page) => !page.id.startsWith('home/'));
    const sortedPages = filteredPages.sort((a, b) => (a.data.order || 999) - (b.data.order || 999));

    llmsContent += `## Pages\n\n`;

    for (const page of sortedPages) {
      const description: string =
        page.data.meta?.description ||
        page.data.description ||
        extractDescription(page.body, 'No description available');
      const override = PLATFORM_HUB_URL_OVERRIDES[page.id];
      const pageUrl = override
        ? `${(site || '').replace(/\/+$/, '')}${override}`
        : buildUrl(page.id);
      const pageTitle = stripHtml(page.data.title);
      llmsContent += `- [${pageTitle}](${pageUrl}) - ${description}\n`;
    }

    llmsContent += `\n## Docs\n\n`;
    llmsContent += `- Full documentation index at ${siteUrl}/docs/llms.txt\n`;

    llmsContent += `\n## MCP\n\n`;
    llmsContent += `- [Datum Docs MCP](${siteUrl}/docs/mcp) - MCP server for AI agents to search and read Datum documentation (JSON-RPC 2.0 over SSE). Tools: \`search_datum_cloud_docs\`, \`query_docs_filesystem_datum_cloud_docs\`.\n`;

    llmsContent += `\n## Skills\n\n`;
    llmsContent += `- [Datum Cloud Skills](https://github.com/datum-cloud/skills) - Agent skills for working with Datum Cloud APIs and infrastructure primitives. Install via \`/plugin marketplace add datum-cloud/skills\` (Claude Code), \`npx skills add https://github.com/datum-cloud/skills\` (npx), or remote rule settings (Cursor). Available: ai-edge, client-traffic, dns, domains, httproute, metrics-export.\n`;

    llmsContent += `\n## Optional\n\n`;
    llmsContent += `- Full site content at ${siteUrl}/llms-full.txt\n`;
    llmsContent += `- Full documentation content at ${siteUrl}/docs/llms-full.txt\n`;

    // Return the response as plain text
    return new Response(llmsContent, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Failed to generate llms.txt:', error);
    return new Response('Error generating llms.txt', { status: 500 });
  }
};

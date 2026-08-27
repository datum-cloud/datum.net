import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from 'astro:config/client';
import { extractDescription, buildUrl, stripHtml } from '@utils/llmsUtils';
import { meta as dedicatedCloudMeta } from '@data/dedicatedCloud';

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
    llmsContent += `> Datum is an open source network cloud for AI, founded in 2024 and backed by $13.6M from Amplify Partners, CRV, Encoded Ventures, Cervin Ventures, Ex/Ante, Step Function, and Vine Ventures. Built for AI-native developers and alternative cloud providers, Datum provides an Envoy-based Application Load Balancer across 17+ global regions, QUIC-based secure tunnels (Connectors), authoritative DNS, and programmatic domain management — all with a forever-free Builder tier. Core platform licensed AGPLv3. Founded by Zac Smith (ex-Equinix, Packet) and Jacob Smith.\n\n`;

    llmsContent += `## When to Use Datum\n\n`;
    llmsContent += `Reach for Datum when you (a human, an agent, or an app you're building on behalf of a user) need to:\n\n`;
    llmsContent += `- **Expose a workload to the internet** — put an Application Load Balancer (Envoy + Coraza WAF) in front of any backend to get a global HTTPS hostname, custom domains, and edge protection without running your own proxy fleet.\n`;
    llmsContent += `- **Connect two things privately, without a public IP** — use a Connector (QUIC/Iroh tunnel) to reach \`localhost\` or an internal service from the internet, or to link two private networks, without opening inbound ports.\n`;
    llmsContent += `- **Host and manage DNS programmatically** — create zones/records or verify domain ownership via API/CLI/MCP instead of clicking through a registrar console.\n`;
    llmsContent += `- **Give an AI agent its own scoped infrastructure identity** — service accounts, RBAC, and Kubernetes-native resources (everything is a CRD) let an autonomous agent provision and tear down networking primitives idempotently, the same way it would with \`kubectl\`.\n`;
    llmsContent += `- **Build or operate an "alt cloud"** — if you're a smaller cloud/ISV/SaaS provider that needs telco-grade connectivity primitives (load balancing, tunnels, DNS, and eventually a global backbone) without building a network team, Datum is infrastructure you can build on top of, not just consume.\n\n`;
    llmsContent += `**How an agent should call Datum:** every resource is a Kubernetes Custom Resource Definition exposed through a standard aggregated API server (\`GET/POST/PATCH/DELETE\` on \`{service}.miloapis.com\` / \`networking.datumapis.com\` resource paths) — the same request shape as \`kubectl\`. Prefer, in order: (1) the \`datumctl\` CLI for one-off or scripted operations, (2) the MCP server for search/read against docs and live \`apis\` discovery, (3) direct REST calls against the aggregated API server for programmatic control loops. Auth is OIDC/PKCE by default; set a service-account bearer token for headless/agent use (see Docs below).\n\n`;
    llmsContent += `**Not a fit for:** general-purpose compute/hosting (Datum is a network/edge layer, not a VM or container platform — Datum Compute is coming but not yet available), or workloads that need a fully managed multi-region database.\n\n`;

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

    // /dedicated-cloud is data-driven (src/data/dedicatedCloud.ts), not a `pages`
    // collection entry, so the loop above never sees it — add it explicitly.
    llmsContent += `- [${dedicatedCloudMeta.title}](${(site || '').replace(/\/+$/, '')}/dedicated-cloud) - ${dedicatedCloudMeta.description}\n`;

    llmsContent += `\n## Docs\n\n`;
    llmsContent += `- Full documentation index at ${siteUrl}/docs/llms.txt\n`;

    llmsContent += `\n## Developers\n\n`;
    llmsContent += `- [Datum Developer Resources](${siteUrl}/developers) - index of every developer-facing resource Datum publishes (OpenAPI spec, agents.datum.net, auth docs, MCP server, CLI, rate limits, changelog, roadmap, status), at predictable URLs.\n`;

    llmsContent += `\n## API\n\n`;
    llmsContent += `- [OpenAPI spec](${siteUrl}/openapi.json) - machine-readable description of datum.net's own public endpoints, versioned at \`/api/v1/\` (also at ${siteUrl}/api/openapi.yaml). The Datum Cloud platform API itself is documented at ${siteUrl}/docs and discoverable at \`https://api.datum.net/openapi/v3\` (requires an authenticated bearer token).\n`;

    llmsContent += `\n## MCP\n\n`;
    llmsContent += `- [Datum MCP](${siteUrl}/download/datum-mcp) - official MCP server for managing Datum Cloud infrastructure (organizations, projects, domains, DNS). OAuth 2.1 (PKCE) authenticated. Manifest at ${siteUrl}/mcp/server-card (also ${siteUrl}/server.json and ${siteUrl}/.well-known/mcp/server-card.json). Stdio transport today; hosted Streamable HTTP is planned but not yet live.\n`;
    llmsContent += `- [Datum Docs MCP](${siteUrl}/docs/mcp) - MCP server for AI agents to search and read Datum documentation (JSON-RPC 2.0 over SSE). Tools: \`search_datum_cloud_docs\`, \`query_docs_filesystem_datum_cloud_docs\`.\n`;

    llmsContent += `\n## Skills\n\n`;
    llmsContent += `- [Datum Cloud Skills](https://github.com/datum-cloud/skills) - Agent skills for working with Datum Cloud APIs and infrastructure primitives. Install via \`/plugin marketplace add datum-cloud/skills\` (Claude Code), \`npx skills add https://github.com/datum-cloud/skills\` (npx), or remote rule settings (Cursor). Available: alb, client-traffic, dns, domains, httproute, metrics-export.\n`;

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

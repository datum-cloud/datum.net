import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from 'astro:config/client';
import { extractDescription, buildUrl, stripHtml } from '@utils/llmsUtils';
import { meta as dedicatedCloudMeta } from '@data/dedicatedCloud';
import { meta as useCasesMeta } from '@data/useCases';
import { inTheWild } from '@data/about';

// Note: handbook entries intentionally excluded — internal company ops content
// is not relevant to AI agents consuming platform documentation.

// These `pages` entries no longer have their own route: /platform replaces the
// old hub, DNS, Compute and Essentials pages (all 302 to /platform in
// server.mjs), and `global-section` is component data, not a page. Listing them
// would hand agents redirecting or dead URLs, so skip them; /platform is
// listed once via src/content/pages/platform.mdx.
const isRedirectedPage = (id: string): boolean =>
  id.startsWith('features/') ||
  id === 'essentials' ||
  id === 'platform/dns' ||
  id === 'platform/compute' ||
  id === 'global-section';

// Brand guideline pages (palette, logos, typography, templates, social) are
// for designers, not agents. Keep them out of `## Pages` and point to the
// brand hub once under `## Optional`.
const isBrandPage = (id: string): boolean => id === 'brand' || id.startsWith('brand/');

export const GET: APIRoute = async () => {
  try {
    // Get project info
    const siteUrl = site;

    // Base structure for llms.txt
    let llmsContent = `# Datum\n\n`;
    llmsContent += `## About\n\n`;
    llmsContent += `> Datum is an open source network cloud for AI, founded in 2024 and backed by $13.6M from Amplify Partners, CRV, Encoded Ventures, Cervin Ventures, Ex/Ante, Step Function, and Vine Ventures. Built for agents, builders, and alternative cloud providers, Datum offers both multi-tenant and dedicated infrastructure. The multi-tenant platform provides an Envoy-based Application Load Balancer across 17+ global regions, QUIC-based secure tunnels (Connectors), authoritative DNS, and programmatic domain management, plus Compute and gVPC private networks in preview. Datum is free to use during public beta; billing begins February 1st, 2027, with advance notice before any charges. Core platform licensed AGPLv3. Founded by Zac Smith (ex-Equinix, Packet) and Jacob Smith.\n\n`;

    llmsContent += `## Start Here\n\n`;
    llmsContent += `- [Datum documentation index](${siteUrl}/docs/llms.txt) - every docs page with a one-line description; the place to find commands, limits, and task guides. Full text in one file: ${siteUrl}/docs/llms-full.txt\n`;
    llmsContent += `- [Agent home](https://agents.datum.net) - what Datum is, pricing, and how an agent should act on it\n\n`;

    llmsContent += `## When to Use Datum\n\n`;
    llmsContent += `Reach for Datum when you (a human, an agent, or an app you're building on behalf of a user) need to:\n\n`;
    llmsContent += `- **Expose a workload to the internet** — put an Application Load Balancer (Envoy + Coraza WAF) in front of any backend to get a global HTTPS hostname, custom domains, and edge protection without running your own proxy fleet.\n`;
    llmsContent += `- **Connect two things privately, without a public IP** — use a Connector (QUIC/Iroh tunnel) to reach \`localhost\` or an internal service from the internet, or to link two private networks, without opening inbound ports.\n`;
    llmsContent += `- **Host and manage DNS programmatically** — create zones/records or verify domain ownership via API/CLI/MCP instead of clicking through a registrar console.\n`;
    llmsContent += `- **Give an AI agent its own scoped infrastructure identity** — service accounts, RBAC, and Kubernetes-native resources (everything is a CRD) let an autonomous agent provision and tear down networking primitives idempotently, the same way it would with \`kubectl\`.\n`;
    llmsContent += `- **Build or operate an "alt cloud"** — if you're a smaller cloud/ISV/SaaS provider that needs telco-grade connectivity primitives (load balancing, tunnels, DNS, and eventually a global backbone) without building a network team, Datum is infrastructure you can build on top of, not just consume.\n\n`;
    llmsContent += `**How an agent should call Datum:** every resource is a Kubernetes Custom Resource Definition exposed through a standard aggregated API server (\`GET/POST/PATCH/DELETE\` on \`{service}.miloapis.com\` / \`networking.datumapis.com\` resource paths) — the same request shape as \`kubectl\`. Prefer, in order: (1) the \`datumctl\` CLI for one-off or scripted operations, (2) the MCP server for search/read against docs and live \`apis\` discovery, (3) direct REST calls against the aggregated API server for programmatic control loops. Auth is OIDC/PKCE by default; set a service-account bearer token for headless/agent use (see Docs below).\n\n`;
    llmsContent += `**Not a fit for:** workloads that need a fully managed multi-region database. Datum is a network and edge layer first; Datum Compute (in preview, with access approved per project) runs apps as isolated Instances in Datum locations, from a standard container image or a unikernel.\n\n`;

    // Get all pages sorted, excluding home/* pages
    const pages = await getCollection('pages');
    const filteredPages = pages.filter(
      (page) => !page.id.startsWith('home/') && !isRedirectedPage(page.id) && !isBrandPage(page.id)
    );
    const sortedPages = filteredPages.sort((a, b) => (a.data.order || 999) - (b.data.order || 999));

    llmsContent += `## Pages\n\n`;

    for (const page of sortedPages) {
      const description: string =
        page.data.meta?.description ||
        page.data.description ||
        extractDescription(page.body, 'No description available');
      const pageUrl = buildUrl(page.id);
      const pageTitle = stripHtml(page.data.title);
      llmsContent += `- [${pageTitle}](${pageUrl}) - ${description}\n`;
    }

    // /dedicated-cloud is data-driven (src/data/dedicatedCloud.ts), not a `pages`
    // collection entry, so the loop above never sees it — add it explicitly.
    llmsContent += `- [${dedicatedCloudMeta.title}](${(site || '').replace(/\/+$/, '')}/dedicated-cloud) - ${dedicatedCloudMeta.description}\n`;
    // /use-cases is data-driven too (src/data/useCases.ts).
    llmsContent += `- [${useCasesMeta.title}](${(site || '').replace(/\/+$/, '')}/use-cases) - ${useCasesMeta.description}\n`;

    // /about, /about/team and /about/in-the-wild are data-driven (src/data/about.ts),
    // not `pages` collection entries — list them explicitly.
    const baseUrl = (site || '').replace(/\/+$/, '');
    llmsContent += `- [About Datum](${baseUrl}/about) - Why Datum exists: the founding insight, investors, and the companies building on it.\n`;
    llmsContent += `- [Meet the Team](${baseUrl}/about/team) - The infrastructure, open source software, and design people building Datum.\n`;
    llmsContent += `- [${inTheWild.crumb}](${baseUrl}/about/in-the-wild) - ${inTheWild.intro}\n`;

    llmsContent += `\n## Developers\n\n`;
    llmsContent += `- [Datum Developer Resources](${siteUrl}/developers) - index of every developer-facing resource Datum publishes (OpenAPI spec, agents.datum.net, auth docs, MCP server, CLI, rate limits, changelog, roadmap, status), at predictable URLs.\n`;

    llmsContent += `\n## API\n\n`;
    llmsContent += `- [OpenAPI spec](${siteUrl}/openapi.json) - machine-readable description of datum.net's own public endpoints, versioned at \`/api/v1/\` (also at ${siteUrl}/api/openapi.yaml). The Datum Cloud platform API itself is documented at ${siteUrl}/docs and discoverable at \`https://api.datum.net/openapi/v3\` (requires an authenticated bearer token).\n`;

    llmsContent += `\n## MCP\n\n`;
    llmsContent += `- [Datum MCP](${siteUrl}/download/datum-mcp) - official MCP server for managing Datum Cloud infrastructure (organizations, projects, domains, DNS). Runs on your machine as the \`datum-mcp\` binary and signs in with your Datum account. Uses stdio by default; \`datum-mcp --mode http\` serves streamable HTTP on localhost. Manifest at ${siteUrl}/mcp/server-card (also ${siteUrl}/server.json and ${siteUrl}/.well-known/mcp/server-card.json). Setup: ${siteUrl}/docs/agents/datum-mcp\n`;
    llmsContent += `- [Datum Docs MCP](${siteUrl}/docs/mcp) - hosted, read-only MCP server for searching and reading Datum documentation. Streamable HTTP at ${siteUrl}/docs/mcp; no sign-in. Tools: \`search_datum_cloud_docs\`, \`query_docs_filesystem_datum_cloud_docs\`.\n`;

    llmsContent += `\n## Skills\n\n`;
    llmsContent += `- [Datum agent skills](${siteUrl}/docs/agents/skills) - skills that teach agents Datum tasks: alb, dns, domains, httproute, metrics-export, networks (client-traffic is not available yet). In Claude Code they ship as plugins in the \`datum-cloud/claude-code-plugins\` marketplace; other agents can use \`npx skills add https://github.com/datum-cloud/skills\`. Install steps: ${siteUrl}/docs/agents/skills\n`;

    llmsContent += `\n## Optional\n\n`;
    llmsContent += `- Full site content at ${siteUrl}/llms-full.txt\n`;
    llmsContent += `- Full documentation content at ${siteUrl}/docs/llms-full.txt\n`;
    llmsContent += `- [Brand guidelines](${buildUrl('brand')}) - logos, color palette, typography, graphics, templates, and social assets\n`;

    // Return the response as plain text
    return new Response(llmsContent, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Failed to generate llms.txt:', error);
    return new Response('Error generating llms.txt', { status: 500 });
  }
};

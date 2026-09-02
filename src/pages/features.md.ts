// Dynamic markdown export of /features. Reads the same source the rendered
// page consumes for its title/description:
//   - src/content/pages/features.mdx (title + description)
// The page body itself is a fully component-composed layout (src/pages/features.astro)
// with no content-collection backing, so those sections are transcribed by
// hand below and need a manual update if that copy changes.
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

function stripHtml(input: string): string {
  return input.replace(/<\/?[^>]+>/g, '').trim();
}

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'features');
    const title = page?.data.title ? stripHtml(page.data.title) : 'Built for Agents';
    const description = page?.data.description ?? '';

    const sections: string[] = [`# ${title}`, ''];
    if (description) sections.push(description, '');

    sections.push(
      '## AI Edge',
      '',
      'Meet the internet in style. Give every agent or app a global edge to absorb attacks, interact with the broader internet, and safely route traffic to backend services.',
      '',
      "- **Powered by Envoy** - Envoy is the internet's leading distributed proxy, deployed at scale with Google, Netflix, Salesforce and more.",
      '- **Built-in Coraza WAF** - Firewalls are hard business. Coraza quickly covers the top OWASP threats.',
      '- **17+ global regions** - Located at major internet "football cities" like Amsterdam, Ashburn, and Tokyo.',
      '',
      '## Connections',
      '',
      "Orchestrate diverse connections, starting with Tunnels. We're focused on supporting all kinds of connections, from developer-focused (Tailscale Tailnets, Wireguard VPNs) to low level L2/L3 telco (AWS Direct Connect, Equinix Fabric, Megaport Onramps). But first, QUIC-based Tunnels.",
      '',
      '- **Zero Trust for Agents** - Safeguard data and bring up workloads with instant connectivity to exactly what it needs.',
      '- **Built on Iroh, powered by QUIC** - Lightweight, flexible tunnels built using the Iroh protocol for direct peer-to-peer connections.',
      '- **Resilient Routing** - Certificate-based routing keeps connections secure, stable, and ready for chaos.',
      '',
      '## Galactic VPC (coming soon)',
      '',
      "Route traffic where you want it. Internet backbones weren't designed for most humans, let alone agents. Our Galactic VPC is built for an agentic world.",
      '',
      '- **SRv6, Policy-Based Overlay** - Define how traffic flows with segment routing that puts you in control of every hop.',
      "- **Fully Programmable** - We're working on a VPC like you'd get in the public cloud, but everywhere. Telemetry included.",
      '- **Optimized for Private Paths** - Skip the public internet and opt for private paths that keep traffic fast, predictable, and secure.',
      '',
      '## Datum Compute (coming soon)',
      '',
      'Isolated, cold-start compute. Datum Compute provides 100% isolation, millisecond cold starts, and scale to zero snapshotting.',
      '',
      '- **Built for AI** - Moving intelligence to the edge with fast, low-cost, secure virtual machines.',
      '- **Tiny and Mighty** - Start in <10 ms with true scale to zero. Run any workload, stateless or stateful.',
      '- **Powered by Unikraft** - Partnered with the crew leading the unikernel revolution.',
      '',
      '## Values that guide how we build',
      '',
      '- **AX**, then **DX**, then **UX**.',
      "- Build for **M's** of backbones, **B's** of tunnels, **T's** of unikernels.",
      "- Be **humble**, **curious**, and **helpful** (we're operators at heart).",
      '- **No weird sales gates**, overt jargon, or marketing crap.',
      '- Ship a first version, then **make it better**!',
      '',
      '## Get started',
      '',
      '- [Pricing](/pricing/) - Forever-free Builder tier, Scaler from $20/month, custom Provider',
      '- [Download datumctl](/download/datumctl/) - CLI for managing your network cloud',
      '- [Download Datum MCP](/download/datum-mcp/) - MCP server for AI tools',
      ''
    );

    const canonicalUrl = 'https://www.datum.net/features';
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
    console.error('Failed to serve /features.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};

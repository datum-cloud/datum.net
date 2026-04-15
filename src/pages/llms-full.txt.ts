import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { cleanContent, formatDate, buildUrl, stripHtml } from '@utils/llmsUtils';
import { fetchStrapiArticles } from '@libs/strapi';

// ---------------------------------------------------------------------------
// Static curated content — maintained by GTM / SEO team
// Update this section when platform facts, features, or pricing change.
// ---------------------------------------------------------------------------
const STATIC_CONTENT = `# Datum — Everything an Agent Needs to Know

> **Document type:** Agent-optimized reference page
> **Source:** datum.net + github.com/datum-cloud
> **Intended audience:** AI agents, LLMs, autonomous systems interacting with or building on the Datum Cloud platform

> **Agent quick-start:** Fetch https://www.datum.net/docs/llms.txt for the complete documentation index.
> Every doc page is available as clean markdown by appending \`.md\` to its URL (e.g., \`https://www.datum.net/docs/overview.md\`).

<AgentInstructions>
## How to consume Datum documentation
1. Fetch https://datum.net/docs/llms.txt — this is the canonical index of all docs
2. Fetch individual pages as .md (e.g., datum.net/docs/overview.md) for clean text
3. For live platform state, use \`datumctl api-resources\` or the MCP \`apis\` tool
4. Submit feedback on incorrect docs via POST to:
   https://datum.net/docs/_mintlify/feedback/datum-4926dda5/agent-feedback
   Body: { "path": "/page-path", "feedback": "description of issue" }
</AgentInstructions>

---

## What Is Datum?

Datum is an **open network cloud** built for the AI era. It gives every agent, application, and builder programmatic access to enterprise-grade internet infrastructure — without requiring a network team.

Datum's mission is to **"help 1,000 new clouds thrive in the AI era"** by unlocking internet superpowers for every builder. Its vision is to be the most trusted way for digital ecosystems to interact, with millions of intelligent connections.

Key facts for agent understanding:

- **Fully programmatic, agent-first interfaces** — every resource is accessible via API, CLI (\`datumctl\`), or MCP server
- **Kubernetes-native control plane** — all resources are Kubernetes Custom Resource Definitions (CRDs); if you know \`kubectl\`, you know Datum
- **Open source** — core platform licensed under AGPLv3; you can audit, fork, or self-host
- **Forever free tier** — the Builder plan is $0/month with no time limit
- **Founded late 2024** by infrastructure veterans from Packet, Voxel, SoftLayer, StackPath, Highwinds, Zscaler; backed by Amplify Partners, CRV, Cervin Ventures, and others

---

## Why Datum Exists (Context for Agents)

Datum was built because three macro trends are reshaping the internet:

1. **Intelligence & Data Everywhere** — AI agents and software are proliferating across every edge and region
2. **1,000s of New Providers ("Alt Clouds")** — specialized security, networking, data, and AI platforms are emerging that need connectivity primitives without building their own network teams
3. **Increased Regulation & Fragmentation (The Splinternet)** — workloads must route deterministically and comply with regional policy

The old way of internet infrastructure is too obscure, too manual, and too telco. Datum's thesis: even the most ambitious AI-native teams lack the knowledge, people, time, and tools to participate in the internet at scale "the old way."

**Target customers ("Alt Clouds"):**
- Alt cloud providers needing networking primitives
- ISVs and SaaS providers embedding connectivity capabilities
- Enterprise customers needing telco-style connectivity management
- AI-native teams building agent workflows that require core internet capabilities

---

## Core Platform Concepts

### Data Model

Datum uses a standard cloud hierarchy:
\`\`\`
Organization
  └── Project
        └── Resources (AI Edge, Tunnels, DNS Zones, Domains, Secrets, etc.)
\`\`\`

- **Personal Org** — created automatically per user; no collaboration; personal sandbox
- **Standard Org** — supports collaboration, shared resources, centralized management
- **Roles:** Owner (full control), Editor (all resources except team members), Viewer (read-only)

### Kubernetes-Native Architecture

Datum's control plane is built on Kubernetes CRDs. The underlying control plane is called **Milo** — an extensible, multi-tenant control plane built with the Kubernetes API library.

Key architectural principles an agent must internalize:

- All services are Kubernetes **aggregated API servers** — not generic CRD controllers
- Each service implements its own storage backend (not etcd)
- API groups follow the pattern \`{service}.miloapis.com\` (e.g., \`resourcemanager.miloapis.com\`, \`iam.miloapis.com\`, \`activity.miloapis.com\`, \`dns.networking.miloapis.com\`)
- Networking-layer resources use \`networking.datumapis.com\`
- All Datum resources follow **declarative management**: define desired state → Datum reconciles the live system to match. No drift, no manual syncing
- Compatible with standard tooling: \`datumctl\`, Helm, kubectl-style commands, and MCP tools

### Permission Model (IAM)

Datum uses a Kubernetes-native IAM system. Key resources:

| Resource            | Scope       | Purpose                                                   |
|---------------------|-------------|-----------------------------------------------------------|
| \`ProtectedResource\` | Cluster     | Declares a resource type and its available permissions    |
| \`Role\`              | Namespaced  | Defines a collection of permissions                       |
| \`PolicyBinding\`     | Namespaced  | Binds a role to users/groups on a specific resource       |
| \`User\`              | Cluster     | Platform user identity                                    |
| \`Group\`             | Namespaced  | Collection of users                                       |

Permissions follow the format \`{service}/{resource}.{action}\` (e.g., \`iam.miloapis.com/users.create\`).

Role hierarchy convention: \`viewer\` → \`editor\` → \`admin\`. Each role inherits permissions from the one below it.

Permission inheritance flows down the resource hierarchy:
\`\`\`
Organization (admin) → Project (admin, inherited) → Service Resources (admin, inherited)
\`\`\`

---

## Current Platform Features

### 1. AI Edge (Generally Available — Free)

An intelligent HTTP proxy and edge layer built on **Envoy Proxy** and powered by **Tetrate**.

- **Protocols supported:** HTTP/1.1, HTTP/2, gRPC, WebSockets, HTTPS
- **WAF:** Coraza-based Web Application Firewall covering top OWASP threats; runs in \`observe\` mode by default, can be set to \`enforced\` (Level 1 Relaxed or Level 2 Balanced)
- **Custom Hostnames:** Verify and attach custom domains; HTTPS enforced by default
- **Basic Auth:** Username/password protection for any AI Edge endpoint
- **Global reach:** 17+ regions across all major internet peering points (see Regions below)
- **Default hostname:** Each AI Edge gets a generated HTTPS hostname automatically
- **Resource kinds:** \`HTTPProxy\`, \`HTTPRoute\`, \`Gateway\`, \`TrafficProtectionPolicy\`
- **Observability:** Portal metrics include upstream latency percentiles (p90, p99), RPS by region, response codes; filter by region

**Use case for agents:** Give any agent or app a global edge to absorb attacks, interact with the broader internet, and safely route traffic to backend services.

---

### 2. Connectors — Tunnels (Generally Available — Free)

Secure tunnels built on the **Iroh protocol** (Rust-based, QUIC-based P2P networking).

- Iroh allows devices to "dial" each other directly using public keys, bypassing NATs and firewalls — no IP address dependency
- Current use case: expose \`localhost\` to the internet via desktop apps (macOS, Windows, Linux)
- Future: "anywhere to anywhere" tunnels; planned support for Tailscale Tailnets, WireGuard VPNs, AWS Direct Connect, Equinix Fabric, Megaport Onramps

**Use case for agents:** Zero-trust connectivity — bring up workloads with instant connectivity to exactly what they need, without public IP addresses.

---

### 3. DNS & Domains (Generally Available — Free)

- **Authoritative DNS:** Globally distributed anycast DNS hosting
- **Nameservers:** \`ns1.datumdomains.net\`, \`ns2.datumdomains.net\`, \`ns3.datumdomains.net\`, \`ns4.datumdomains.net\`
- **Record types:** A, AAAA, CAA, NS, SRV, TXT, CNAME, MX, SOA, TLSA, SVCB, HTTPS, ALIAS (CNAME flattening)
- **Zone management:** BIND format import/export, bulk import via screenshot or DNS record sync
- **Resource kinds:** \`DNSZone\`, \`DNSRecordSet\`, \`DNSZoneClass\` (cluster-scoped)
- **API group:** \`dns.networking.miloapis.com\`
- **Domain tracking:** Add and verify domains regardless of registrar; programmatic access via MCP and \`datumctl\`
- **Audit log:** All zone and record changes tracked with user attribution and timestamps
- **Project-scoped:** Zones managed per project with RBAC

---

### 4. Platform Essentials (Generally Available — Free)

- **Secrets:** Create and manage secret resources within projects
- **Teams & RBAC:** Fine-grained roles (Owner, Editor, Viewer) at org and project level
- **Machine Accounts:** Non-human identities for agent/automation use cases
- **OTel Metrics Export:** Export OpenTelemetry metrics to Grafana Cloud via ExportPolicies with MetricSQL filtering; prebuilt Grafana dashboards (IDs: \`23939\` — Datum Overview, \`24261\` — Datum Proxy)
- **Activity Logs:** Audit log of all resource changes using the \`activity.miloapis.com\` API; filterable via portal or \`datumctl\` with CEL expressions; default window is last 24 hours
- **Programmatic edge tracing:** \`https://edge.datum.net/api/edge-info\` (JSON) or \`https://edge.datum.net/api/trace\` (plaintext)

---

### 5. Galactic VPC (Coming in 2026 — Scaler Tier)

A global virtual private backbone service built using **Segment Routing over IPv6 (SRv6)** — RFC 8986.

- Policy-based segment routing (each instruction is an IPv6 Segment Identifier / SID)
- Programs traffic paths using the native IPv6 data plane — no MPLS required
- Skip the public internet; opt for private paths that are fast, predictable, and secure
- Cloud onramps (AWS, GCP, etc.) included in Scaler plan

---

### 6. UFO — Unikernel Function Offload (Coming Soon)

Edge compute layer built in partnership with **Unikraft**.

- 100% workload isolation
- Millisecond cold starts (<10ms)
- True scale-to-zero snapshotting
- Stateless or stateful workloads
- Optimized for agentic and network edge use cases

---

## Global Network Regions

Datum operates at major internet peering points (IXPs) globally. Region naming format: \`<geo>-<direction>-<number><az>\` (e.g., \`us-east-1a\`).

| Region Code    | Metropolitan Area   |
|----------------|---------------------|
| us-east-1      | Ashburn, VA         |
| us-east-2      | New York City       |
| us-central-1   | Dallas              |
| us-west-1      | San Jose, CA        |
| ca-east-1      | Toronto             |
| cl-central-1   | Chile               |
| br-east-1      | São Paolo           |
| nl-west-1      | Amsterdam           |
| de-central-1   | Frankfurt           |
| gb-south-1     | London              |
| ae-north-1     | Dubai               |
| za-central-1   | Johannesburg        |
| in-west-1      | Mumbai              |
| sg-central-1   | Singapore           |
| au-east-1      | Sydney              |
| jp-east-1      | Tokyo               |

---

## Pricing

| Plan         | Price              | Who It's For                                                     |
|--------------|--------------------|------------------------------------------------------------------|
| **Builder**  | **$0/month**       | Personal projects, development, experimentation                  |
| **Scaler**   | $20/month + usage  | Production apps (launching H1 2026); includes $10 usage credits  |
| **Provider** | Custom             | Alt cloud providers; become a design partner                     |

**Builder tier includes (forever free):**
- AI Edge (Envoy Proxy + Coraza WAF)
- Connectors (QUIC Tunnels)
- DNS and Domains
- OTel Metrics Export
- Secrets, Teams, RBAC, Machine Accounts

**Scaler tier adds (coming H1 2026):**
- Galactic VPC
- Cloud Onramps (AWS, GCP)
- Uptime SLAs
- 24/7 email support
- Certificate management and Domain Connect

---

## How to Sign Up

1. **Go to:** \`https://cloud.datum.net\` (or \`https://auth.datum.net/ui/v2/login/register\`)
2. **Authenticate** using Google or GitHub OAuth — no email/password registration
3. **Your account** is automatically associated with the primary email on your OAuth account
4. A **Personal Org** is created for you automatically as a sandbox
5. To collaborate, **create a Standard Organization** and invite team members

> **For agents/automation:** Use Machine Accounts for non-human identities. Machine Accounts support RBAC and can be scoped to projects or organizations. For headless auth, set \`DATUM_TOKEN\` environment variable to bypass browser login.

---

## How to Get Started (Step by Step)

### Option A: Web Portal

1. Sign up at \`https://cloud.datum.net\`
2. Create a project inside your Personal Org (or a new Standard Org)
3. Create an AI Edge: navigate to AI Edge → New → configure upstream URL → get your generated HTTPS hostname
4. (Optional) Add and verify a custom domain
5. (Optional) Set up a Tunnel via the Desktop App to expose localhost

### Option B: CLI (\`datumctl\`)

\`datumctl\` is modeled after \`kubectl\`. If you've used Kubernetes, the patterns are identical.

**Install:**
\`\`\`bash
# macOS via Homebrew
brew install --cask datum-cloud/tap/desktop

# Or download from: https://www.datum.net/download/
\`\`\`

**Auth:**
\`\`\`bash
datumctl login
# Opens browser for OIDC/PKCE OAuth — no static API keys
# Credentials stored securely and auto-refreshed
\`\`\`

**Key global flags:**
\`\`\`
--organization    Organization name
--project         Project name
--namespace       Namespace scope for CLI request
--token           Bearer token override (for automation)
--output          Output format (table, json, yaml)
-v                Log verbosity level
\`\`\`

**Common operations follow Kubernetes patterns:**
\`\`\`bash
datumctl get httpproxies
datumctl create -f <manifest.yaml>
datumctl describe httpproxy <name>
datumctl delete httpproxy <name>
\`\`\`

---

## Further Reading

- Full documentation index: https://www.datum.net/docs/llms.txt
- Full documentation content: https://www.datum.net/docs/llms-full.txt
- Concise site index: https://www.datum.net/llms.txt

`;

// ---------------------------------------------------------------------------
// Dynamic content — auto-generated from Strapi blog and handbook
// ---------------------------------------------------------------------------
export const GET: APIRoute = async () => {
  try {
    let dynamicContent = '';

    // Blog posts from Strapi
    const strapiArticles = await fetchStrapiArticles();
    const sortedPosts = strapiArticles.sort((a, b) => {
      const dateA = a.originalPublishedAt ? new Date(a.originalPublishedAt).getTime() : 0;
      const dateB = b.originalPublishedAt ? new Date(b.originalPublishedAt).getTime() : 0;
      return dateB - dateA;
    });

    dynamicContent += `---\n\n## Blog\n\n`;
    for (const post of sortedPosts) {
      dynamicContent += `### ${stripHtml(post.title)}\n\n`;
      dynamicContent += `URL: ${buildUrl(post.slug, 'blog')}\n\n`;
      if (post.originalPublishedAt) {
        dynamicContent += `Date: ${formatDate(post.originalPublishedAt)}\n\n`;
      }
      if (post.description) {
        dynamicContent += `Description: ${stripHtml(post.description)}\n\n`;
      }
      dynamicContent += '---\n\n';
    }

    // Handbook full content
    const handbooks = await getCollection('handbooks', ({ data }) => !data.draft);

    const handbookCategories: { [key: string]: typeof handbooks } = {};
    handbooks.forEach((handbook) => {
      const category = handbook.id.split('/')[0];
      if (!handbookCategories[category]) {
        handbookCategories[category] = [];
      }
      handbookCategories[category].push(handbook);
    });

    dynamicContent += `## Handbook\n\n`;

    for (const category in handbookCategories) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      dynamicContent += `### ${categoryName}\n\n`;

      const sortedHandbooks = handbookCategories[category].sort((a, b) => {
        const orderA = a.data.sidebar?.order || 999;
        const orderB = b.data.sidebar?.order || 999;
        return orderA - orderB;
      });

      for (const handbook of sortedHandbooks) {
        dynamicContent += `#### ${stripHtml(handbook.data.title)}\n\n`;
        dynamicContent += `URL: ${buildUrl(handbook.id, 'handbook')}\n\n`;

        if (handbook.data.description) {
          dynamicContent += `Description: ${stripHtml(handbook.data.description)}\n\n`;
        }

        if (handbook.data.lastModified) {
          dynamicContent += `Updated: ${handbook.data.lastModified}\n\n`;
        }

        try {
          dynamicContent += cleanContent(handbook.body) + '\n\n';
        } catch (error) {
          dynamicContent += `[Content processing error: ${error}]\n\n`;
        }
        dynamicContent += '---\n\n';
      }
    }

    return new Response(STATIC_CONTENT + dynamicContent, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Failed to generate llms-full.txt:', error);
    return new Response(`Error generating llms-full.txt: ${error}`, { status: 500 });
  }
};

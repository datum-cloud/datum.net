# Content Structure

This document provides a detailed overview of the content organization in `src/content/`.

```
src/content/
├── about/ (/about)
│   ├── images/
│   │   ├── amplify.png
│   │   ├── cervin.png
│   │   ├── encoded.png
│   │   ├── highwinds.png
│   │   ├── illustration.png
│   │   ├── packet.png
│   │   ├── rock.png
│   │   ├── sf.png
│   │   ├── softlayer.png
│   │   ├── stackpath.png
│   │   ├── vine.png
│   │   ├── voxel.jpeg
│   │   ├── voxel.png
│   │   └── zscaler.png
│   ├── index.mdx (main page)
│   ├── our-purpose.mdx
│   ├── team.mdx
│   └── we-value.mdx
│
├── authors/
│   ├── assets/
│   │   └── images/
│   │       ├── alex.png
│   │       ├── chris.png
│   │       ├── felix.png
│   │       ├── jacob.png
│   │       ├── jose.png
│   │       ├── joshua.webp
│   │       ├── scot.webp
│   │       ├── steve.webp
│   │       ├── yahya.png
│   │       └── zac.png
│   ├── alex.mdx
│   ├── brian-toresdahl.mdx
│   ├── chris.mdx
│   ├── dodik-gaghan.mdx
│   ├── fwidjaja.mdx
│   ├── groupTeam.json
│   ├── jacob-smith.mdx
│   ├── jose.mdx
│   ├── scot-wells.mdx
│   ├── scot.mdx
│   ├── steve.mdx
│   ├── yahya.mdx
│   └── zac-smith.mdx
│
├── blog/ (/blog)
│   ├── assets/
│   │   └── images/
│   │       ├── blog-1-thumb.png
│   │       ├── blog-1.png
│   │       ├── blog-2-thumb.png
│   │       ├── blog-2.png
│   │       ├── blog-3-thumb.png
│   │       └── blog-3.png
│   ├── claude-meet-cross-connects.mdx
│   ├── fine-tuning-our-marketing-mix.mdx
│   ├── from-cage-nuts-to-kubernetes.mdx
│   ├── learning-from-dying-networks.mdx
│   ├── meet-olli.mdx
│   ├── open-sourcing-domain-validation.mdx
│   ├── open-source-strategy.mdx
│   └── the-network-stupid.mdx
│
├── careers/
│   └── assets/
│       └── image.png
│
├── categories/
│   ├── business-strategy.mdx
│   ├── cloud-infrastructure.mdx
│   ├── network-architecture.mdx
│   ├── network-security.mdx
│   ├── open-source.mdx
│   └── under-the-hood.mdx
│
├── changelog/ (/resources/changelog)
│   ├── 0.0.1.md
│   ├── 0.1.0.md
│   ├── 0.1.1.md
│   └── index.md (main page)
│
├── docs/
│   └── docs/
│       ├── alt-cloud/
│       │   ├── domain-validation.mdx
│       │   └── index.mdx
│       ├── api/
│       │   ├── authenticating.mdx
│       │   ├── connecting-to-the-api.mdx
│       │   ├── index.mdx
│       │   ├── locations.mdx
│       │   ├── networks.mdx
│       │   ├── reference.mdx
│       │   ├── resources.mdx
│       │   └── workloads.mdx
│       ├── assets/
│       │   ├── domains.mdx
│       │   ├── index.mdx
│       │   └── secrets.mdx
│       ├── connections/
│       │   ├── connections.mdx
│       │   ├── galactic-vpc.mdx
│       │   └── index.mdx
│       ├── developer-guide.mdx
│       ├── galactic-vpc/
│       │   ├── index.mdx
│       │   ├── installation.mdx
│       │   └── naming-numbering.mdx
│       ├── glossary.mdx
│       ├── guides.mdx
│       ├── infrastructure/
│       │   ├── index.mdx
│       │   ├── network.mdx
│       │   └── zones-regions.mdx
│       ├── metrics/
│       │   ├── grafana-cloud.mdx
│       │   └── index.mdx
│       ├── overview/
│       │   ├── pricing.mdx
│       │   ├── products.mdx
│       │   ├── support.mdx
│       │   └── why-datum.mdx
│       ├── platform/
│       │   ├── authentication.mdx
│       │   ├── groups-members.mdx
│       │   ├── index.mdx
│       │   ├── organizations.mdx
│       │   ├── projects.mdx
│       │   └── user-preferences.mdx
│       ├── quickstart/
│       │   ├── account-setup.mdx
│       │   ├── datum-concepts.mdx
│       │   ├── datum-mcp.mdx
│       │   ├── datumctl.mdx
│       │   ├── index.mdx
│       │   └── open-source.mdx
│       ├── runtime/
│       │   ├── ai-gateway.mdx
│       │   ├── dns.mdx
│       │   ├── index.mdx
│       │   └── proxy.mdx
│       ├── tasks/
│       │   └── index.mdx
│       ├── tutorials/
│       │   ├── index.mdx
│       │   └── infra-provider-gcp.mdx
│       └── workflows/
│           ├── 1-click-waf.mdx
│           ├── grafana-cloud.mdx
│           └── index.mdx
│
├── faq/
│   ├── builder-tier-free.mdx
│   ├── provider-tier.mdx
│   ├── scaler-launch.mdx
│   └── traffic-usage.mdx
│
├── features/ (/features)
│   ├── 1-click-waf.md
│   ├── agpl-license.md
│   ├── aws-gcp-byoc.md
│   ├── bring-your-ip-space.md
│   ├── built-with-zero-trust.md
│   ├── datum-mcp.md
│   ├── domains.md
│   ├── enterprise-ready.md
│   ├── grafana-cloud.md
│   ├── index.mdx (main page)
│   ├── internet-edge.md
│   ├── kubernetes-friendly.md
│   ├── machine-accounts.md
│   ├── network.md
│   ├── role-based-access-control.md
│   ├── social-logins.md
│   └── sso-support.md
│
├── handbook/ (/about/handbook)
│   ├── about/
│   │   ├── index.md
│   │   ├── model.md
│   │   ├── purpose.md
│   │   ├── strategy.md
│   │   └── trends.md
│   ├── assets/
│   │   └── sample.png
│   ├── culture/
│   │   ├── build-or-buy.md
│   │   ├── index.md
│   │   ├── open-by-default.md
│   │   ├── purchasing.md
│   │   ├── rhythms.md
│   │   ├── tooling.md
│   │   └── using-github.md
│   ├── eos/
│   │   ├── marketing-strategy.md
│   │   ├── product-strategy.md
│   │   ├── revenue-model.md
│   │   ├── sales-strategy.md
│   │   ├── target-customers.md
│   │   ├── our-competitive-advantage.md
│   │   └── brand-identity.md
│   ├── images/
│   │   └── handbook.webp
│   ├── index.md (main page)
│   ├── policy/
│   │   ├── access-control.md
│   │   ├── anti-harassment.md
│   │   ├── change-management.md
│   │   ├── code-of-conduct.md
│   │   ├── data-retention.md
│   │   ├── disaster-recovery.md
│   │   ├── incident-disclosure.md
│   │   ├── incident-response.md
│   │   ├── index.md
│   │   ├── information-classification.md
│   │   ├── passwords.md
│   │   ├── patch-management.md
│   │   ├── personnel.md
│   │   ├── risk-assessment.md
│   │   ├── testing.md
│   │   └── vendors.md
│   ├── product/
│   │   ├── index.md
│   │   ├── pricing.md
│   │   ├── roadmap.md
│   │   ├── strategy.md
│   │   └── vision.md
│   └── technical/
│       ├── change.md
│       ├── components.md
│       ├── incidents.md
│       ├── index.md
│       ├── Infrastructure.md
│       └── milo.md
│
├── huddles/
│   ├── 2024-12-04.mdx
│   ├── 2025-01-15.mdx
│   ├── 2025-02-12.mdx
│   ├── 2025-03-12.mdx
│   ├── 2025-04-09.mdx
│   ├── 2025-05-14.mdx
│   ├── 2025-06-11.mdx
│   ├── 2025-07-09.mdx
│   ├── 2025-08-13.mdx
│   ├── 2025-09-10.mdx
│   ├── 2025-10-08.mdx
│   ├── 2025-11-12.mdx
│   ├── 2025-12-10.mdx
│   ├── 2026-01-14.mdx
│   └── 2026-02-11.mdx
│
├── images/
│   └── og/
│       ├── about.png
│       ├── blog.png
│       ├── brand.png
│       ├── community.png
│       ├── contact.png
│       ├── default.png
│       ├── docs.png
│       ├── handbook.png
│       ├── home.png
│       ├── pricing.png
│       └── product.png
│
├── legal/
│   ├── privacy.mdx
│   └── terms.mdx
│
├── pages/
│   ├── assets/
│   │   ├── chat/
│   │   │   ├── founders.png
│   │   │   ├── Frame 1410121753.png
│   │   │   ├── Frame 1410121754.png
│   │   │   └── Frame 1410121755.png
│   │   └── home/
│   │       ├── anthropic.webp
│   │       ├── aws.webp
│   │       ├── databricks.webp
│   │       ├── mistralai.webp
│   │       ├── openai.webp
│   │       └── stabilityai.webp
│   ├── blog.mdx
│   ├── brand/
│   │   ├── assets/
│   │   │   ├── color-weight.png
│   │   │   ├── color.png
│   │   │   ├── colors.png
│   │   │   ├── gallery/
│   │   │   │   ├── apps-connections-metric.png
│   │   │   │   ├── hero.png
│   │   │   │   ├── open-network.png
│   │   │   │   ├── our-purpose.png
│   │   │   │   ├── qa.png
│   │   │   │   ├── signup.png
│   │   │   │   ├── use-cases.png
│   │   │   │   └── what-does-good-look-like.png
│   │   │   ├── gallery.png
│   │   │   ├── iconography.png
│   │   │   ├── illustration.png
│   │   │   ├── illustrations/
│   │   │   │   ├── illa-1.png
│   │   │   │   ├── illa-2.png
│   │   │   │   ├── illa-3.png
│   │   │   │   └── illa-4.png
│   │   │   ├── logos/
│   │   │   │   ├── horizontal-dark.png
│   │   │   │   ├── horizontal-light.png
│   │   │   │   ├── stacked-dark.png
│   │   │   │   └── stacked-light.png
│   │   │   ├── logos.png
│   │   │   ├── lucide-icons.png
│   │   │   ├── principles.png
│   │   │   ├── resources.png
│   │   │   ├── social/
│   │   │   │   ├── favicons.png
│   │   │   │   ├── github.png
│   │   │   │   ├── opengraph.png
│   │   │   │   └── social-icons.png
│   │   │   ├── social.png
│   │   │   └── typography/
│   │   │       ├── alliance.png
│   │   │       └── canela.png
│   │   ├── color.mdx
│   │   ├── iconography.mdx
│   │   ├── imagery.mdx
│   │   ├── index.mdx
│   │   ├── logos.mdx
│   │   ├── principles.mdx
│   │   ├── social.mdx
│   │   └── typography.mdx
│   ├── community-huddle.mdx
│   ├── contact.mdx
│   ├── docs.mdx
│   ├── global-section.md
│   ├── home/
│   │   ├── images/
│   │   │   ├── Antrhopic.png
│   │   │   ├── AWS.png
│   │   │   ├── Cockroach.png
│   │   │   ├── Coreweave.png
│   │   │   ├── Crosby.png
│   │   │   ├── Databricks.png
│   │   │   ├── Domo.png
│   │   │   ├── Google-Cloud.png
│   │   │   ├── Grafana.png
│   │   │   ├── Harvey.png
│   │   │   ├── Loveable.png
│   │   │   ├── OpenAI.png
│   │   │   ├── Perplexity.png
│   │   │   ├── Robovision.png
│   │   │   ├── Snowflakes.png
│   │   │   ├── svgs/
│   │   │   │   ├── Antrhopic.svg
│   │   │   │   ├── AWS.svg
│   │   │   │   ├── Cockroach.svg
│   │   │   │   ├── Coreweave.svg
│   │   │   │   ├── Crosby.svg
│   │   │   │   ├── Databricks.svg
│   │   │   │   ├── Domo.svg
│   │   │   │   ├── Google-Cloud.svg
│   │   │   │   ├── Grafana.svg
│   │   │   │   ├── Harvey.svg
│   │   │   │   ├── Loveable.svg
│   │   │   │   ├── OpenAI.svg
│   │   │   │   ├── Perplexity.svg
│   │   │   │   ├── Robovision.svg
│   │   │   │   ├── Snowflakes.svg
│   │   │   │   ├── Together.svg
│   │   │   │   ├── Vercel.svg
│   │   │   │   └── Wasmer.svg
│   │   │   ├── Together.png
│   │   │   ├── Vercel.png
│   │   │   └── Wasmer.png
│   │   ├── what-does-good-look-like.md
│   │   └── why-evolve.md
│   ├── home.mdx (main page)
│   ├── pricing.mdx
│   ├── request-access.mdx
│   ├── resources/
│   │   ├── images/
│   │   │   ├── crossplane.png
│   │   │   ├── datum.png
│   │   │   ├── envoy.png
│   │   │   ├── hickorydns.png
│   │   │   ├── iroh.png
│   │   │   ├── iroh.svg
│   │   │   ├── ren.png
│   │   │   └── srv6.png
│   │   └── open-source.mdx
│   └── roadmap.mdx
│
└── pricing/
    ├── free.json
    ├── provider.json
    └── scaler.json
```

## Content Organization

### About (`about/`)

Company information pages including:

- Main about page (`index.mdx`)
- Our purpose, team, and values pages
- Company logo images

### Authors (`authors/`)

Author profiles for blog posts:

- Individual author MDX files
- Author images in `assets/images/`
- Team grouping configuration (`groupTeam.json`)

### Blog (`blog/`)

Blog posts and related assets:

- Blog post MDX files
- Blog images in `assets/images/`

### Careers (`careers/`)

Career and job posting content:

- Career-related images

### Categories (`categories/`)

Blog post category definitions:

- Business strategy
- Cloud infrastructure
- Network architecture
- Network security
- Open source
- Under the hood

### Changelog (`changelog/`)

Version changelog entries:

- Version-specific changelog files (e.g., `0.0.1.md`)
- Main changelog index page

### Documentation (`docs/docs/`)

Starlight-based documentation organized by topic:

- **alt-cloud/** - Alternative cloud configurations
- **api/** - API documentation
- **assets/** - Asset management (domains, secrets)
- **connections/** - Connection management and Galactic VPC
- **galactic-vpc/** - Galactic VPC documentation
- **guides.mdx** - User guides (single file)
- **infrastructure/** - Infrastructure documentation
- **metrics/** - Metrics and monitoring
- **overview/** - Platform overview and pricing
- **platform/** - Platform features (auth, organizations, projects)
- **quickstart/** - Getting started guides
- **runtime/** - Runtime features (AI gateway, DNS, proxy)
- **tasks/** - Task documentation
- **tutorials/** - Step-by-step tutorials
- **workflows/** - Workflow documentation

### FAQ (`faq/`)

Frequently asked questions:

- Builder tier questions
- Provider tier questions
- Scaler launch information
- Traffic usage information

### Features (`features/`)

Feature descriptions and documentation:

- Feature markdown files
- Main features index page

### Handbook (`handbook/`)

Company handbook organized by department:

- **about/** - About the company
- **culture/** - Company culture and working practices
- **eos/** - Engineering, operations, and systems
- **policy/** - HR policies and security policies
- **product/** - Product strategy and vision
- **technical/** - Engineering practices and infrastructure

### Huddles (`huddles/`)

Community huddle content:

- Date-based huddle files (YYYY-MM-DD.mdx format)

### Images (`images/`)

Shared image assets:

- **og/** - Open Graph images for social media sharing

### Legal (`legal/`)

Legal documents:

- Privacy policy
- Terms of service

### Pages (`pages/`)

Static page content:

- **brand/** - Brand guidelines and assets
- **home/** - Homepage content and images
- **resources/** - Resource pages and images
- Various page MDX files (blog, contact, docs, pricing, etc.)

### Pricing (`pricing/`)

Pricing tier configurations (JSON):

- Free tier
- Provider tier
- Scaler tier

## File Naming Conventions

- **Content files**: kebab-case (e.g., `our-purpose.mdx`, `team.mdx`)
- **Image files**: kebab-case or camelCase (e.g., `blog-1.png`, `Antrhopic.png`)
- **Huddle files**: Date format (e.g., `2025-01-15.mdx`)
- **Changelog files**: Version format (e.g., `0.1.0.md`)

## Content Types

- **MDX files** (`.mdx`) - Content with React component support
- **Markdown files** (`.md`) - Standard markdown content
- **JSON files** (`.json`) - Structured data (pricing, team groups)
- **Image files** - PNG, JPEG, WebP, SVG formats

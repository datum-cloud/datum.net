# Content Structure

This document provides a detailed overview of the content organization in `src/content/`.

```
src/content/
├── about/ (/about)
│   ├── images/
│   │   ├── about.png
│   │   ├── amplify.png
│   │   ├── cervin.png
│   │   ├── companies/ (company logos)
│   │   ├── encoded.png
│   │   ├── illustration-2.png
│   │   ├── illustration.png
│   │   ├── investors/ (investor logos)
│   │   ├── rock.png
│   │   ├── sf.png
│   │   ├── vine.png
│   │   └── voxel.jpeg
│   ├── companies.mdx
│   ├── index.mdx (main page)
│   ├── investors.mdx
│   ├── our-mission.mdx
│   ├── our-purpose.mdx
│   ├── team.mdx
│   └── we-value.mdx
│
├── authors/
│   ├── assets/
│   │   └── illustration/ (author illustrations)
│   ├── brett-mertens.mdx
│   ├── brian-toresdahl.mdx
│   ├── chris-berridge.mdx
│   ├── dodik-gaghan.mdx
│   ├── drew-raines.mdx
│   ├── edo-aria.mdx
│   ├── evan-vetere.mdx
│   ├── felix-widjaja.mdx
│   ├── groupTeam.json
│   ├── jacob-smith.mdx
│   ├── jose-szychowski.mdx
│   ├── kaley-gelineau.mdx
│   ├── manish-singh.mdx
│   ├── matt-jenkinson.mdx
│   ├── ollie-miller.mdx
│   ├── ronggur-habibun.mdx
│   ├── scot-wells.mdx
│   ├── silvia-olivares.mdx
│   ├── steve-smyser.mdx
│   ├── tom-daly.mdx
│   ├── yahya-fakhroji.mdx
│   ├── zac-smith.mdx
│   └── zach-smith.mdx
│
├── blog/ (/blog)
│   ├── assets/
│   │   └── images/ (blog post images)
│   ├── claude-meet-cross-connects.mdx
│   ├── control-plane-for-modern-service-providers.mdx
│   ├── fine-tuning-our-marketing-mix.mdx
│   ├── from-cage-nuts-to-kubernetes.mdx
│   ├── helping-1k-clouds-thrive.mdx
│   ├── internet-superpowers-for-every-builder.mdx
│   ├── learning-from-dying-networks.mdx
│   ├── meet-olli.mdx
│   ├── open-source-strategy.mdx
│   ├── open-sourcing-domain-validation.mdx
│   └── the-network-stupid.mdx
│
├── careers/
│   └── images/
│       └── careers.png
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
│       ├── galactic-vpc/
│       │   ├── index.mdx
│       │   ├── installation.mdx
│       │   └── naming-numbering.mdx
│       ├── glossary.mdx
│       ├── guides.mdx
│       ├── index.mdx
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
│       │   ├── dns/
│       │   │   ├── alias.mdx
│       │   │   └── index.mdx
│       │   ├── index.mdx
│       │   └── ai-edge.mdx
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
│   │   ├── 1-year-plan.md
│   │   ├── 3-year-picture.md
│   │   ├── index.mdx
│   │   ├── marketing-strategy.md
│   │   ├── quarterly-conversations.md
│   │   ├── quarterly-rocks.md
│   │   ├── vto.md
│   │   └── weekly-scorecard.md
│   ├── images/
│   │   └── EOS-Model.webp
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
│   │   ├── customers.md
│   │   ├── fit.md
│   │   ├── index.md
│   │   ├── pricing.md
│   │   └── roadmap.md
│   └── technical/
│       ├── change.md
│       ├── components.md
│       ├── incidents.md
│       ├── index.md
│       ├── Infrastructure.md
│       └── milo.md
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
│   │   ├── home/
│   │   │   ├── anthropic.webp
│   │   │   ├── aws.webp
│   │   │   ├── databricks.webp
│   │   │   ├── mistralai.webp
│   │   │   ├── openai.webp
│   │   │   └── stabilityai.webp
│   │   ├── ui.png
│   │   └── ui.svg
│   ├── blog.mdx
│   ├── brand/
│   │   ├── assets/ (brand assets and gallery images)
│   │   ├── color.mdx
│   │   ├── iconography.mdx
│   │   ├── imagery.mdx
│   │   ├── index.mdx
│   │   ├── logos.mdx
│   │   ├── principles.mdx
│   │   ├── social.mdx
│   │   └── typography.mdx
│   ├── career.mdx
│   ├── contact.mdx
│   ├── docs.mdx
│   ├── events.mdx
│   ├── global-section.md
│   ├── home/
│   │   ├── images/ (partner/company logos)
│   │   ├── items.json
│   │   ├── what-does-good-look-like.md
│   │   └── why-evolve.md
│   ├── home.mdx (main page)
│   ├── pricing.mdx
│   ├── resources/
│   │   ├── images/ (open source project logos)
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
- Companies and investors pages (`companies.mdx`, `investors.mdx`)
- Our mission, purpose, team, and values pages
- Company, investor, and historical images in `images/`

### Authors (`authors/`)

Author profiles for blog posts:

- Individual author MDX files (20+ team members)
- Author illustrations in `assets/illustration/`
- Team grouping configuration (`groupTeam.json`)

### Blog (`blog/`)

Blog posts and related assets:

- Blog post MDX files (11 posts)
- Blog images in `assets/images/`

### Careers (`careers/`)

Career and job posting content:

- Career page image (`images/careers.png`)

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

Documentation organized by topic:

- **alt-cloud/** - Alternative cloud configurations
- **api/** - API documentation (8 pages)
- **assets/** - Asset management (domains, secrets)
- **connections/** - Connection management and Galactic VPC
- **galactic-vpc/** - Galactic VPC documentation
- **glossary.mdx** - Terms and definitions
- **guides.mdx** - User guides
- **index.mdx** - Documentation home page
- **infrastructure/** - Infrastructure documentation
- **metrics/** - Metrics and monitoring
- **overview/** - Platform overview and pricing
- **platform/** - Platform features (auth, organizations, projects)
- **quickstart/** - Getting started guides (6 pages)
- **runtime/** - Runtime features (AI gateway, DNS with alias support, AI Edge)
- **tasks/** - Task documentation
- **tutorials/** - Step-by-step tutorials
- **workflows/** - Workflow documentation (3 pages)

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

- **about/** - About the company (5 pages)
- **culture/** - Company culture and working practices (7 pages)
- **eos/** - Entrepreneurial Operating System including:
  - 1-year plan, 3-year picture
  - Vision/Traction Organizer (VTO)
  - Quarterly conversations and rocks
  - Weekly scorecard
  - Marketing strategy
- **images/** - Handbook images (EOS Model)
- **policy/** - HR policies and security policies (16 pages)
- **product/** - Product strategy including customers, fit, pricing, roadmap (5 pages)
- **technical/** - Engineering practices and infrastructure (6 pages)

### Images (`images/`)

Shared image assets:

- **og/** - Open Graph images for social media sharing

### Legal (`legal/`)

Legal documents:

- Privacy policy
- Terms of service

### Pages (`pages/`)

Static page content:

- **brand/** - Brand guidelines and assets (8 pages: color, iconography, imagery, logos, principles, social, typography)
- **home/** - Homepage content, partner/company logos, and feature items (`items.json`)
- **resources/** - Resource pages including open-source projects
- Various page MDX files:
  - `blog.mdx` - Blog landing page
  - `career.mdx` - Careers page
  - `contact.mdx` - Contact page
  - `docs.mdx` - Documentation landing page
  - `events.mdx` - Events page
  - `home.mdx` - Main homepage
  - `pricing.mdx` - Pricing page
  - `roadmap.mdx` - Product roadmap
  - `global-section.md` - Global section content
- UI assets in `assets/` (chat and home directories, plus UI graphics)

### Pricing (`pricing/`)

Pricing tier configurations (JSON):

- Free tier
- Provider tier
- Scaler tier

## File Naming Conventions

- **Content files**: kebab-case (e.g., `our-purpose.mdx`, `team.mdx`, `1-year-plan.md`)
- **Image files**: kebab-case or PascalCase (e.g., `careers.png`, `EOS-Model.webp`)
- **Changelog files**: Version format (e.g., `0.1.0.md`)
- **Author files**: kebab-case with full names (e.g., `chris-berridge.mdx`, `zac-smith.mdx`)

## Content Types

- **MDX files** (`.mdx`) - Content with React component support (most pages, blog, authors, features index)
- **Markdown files** (`.md`) - Standard markdown content (handbook, features, changelog, some pages)
- **JSON files** (`.json`) - Structured data (pricing tiers, team grouping, home items)
- **Image files** - PNG, JPEG, WebP, SVG formats

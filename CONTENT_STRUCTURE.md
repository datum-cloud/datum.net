# Content Structure

This document details the organization of content in the Datum Inc. website. All content is managed through Astro's Content Collections for type-safety and validation.

## Content Collections Overview

The `/src/content` directory contains all MDX/Markdown content organized into collections:

| Collection   | Purpose                         | Route Pattern               |
| :----------- | :------------------------------ | :-------------------------- |
| `about`      | About company pages             | `/about/*`                  |
| `authors`    | Author profiles for blog posts  | `/authors/[author]`         |
| `blog`       | Blog posts and articles         | `/blog/[slug]`              |
| `categories` | Blog post categories            | `/blog/category/[category]` |
| `changelog`  | Product release notes           | `/resources/changelog`      |
| `docs`       | Technical documentation         | `/docs/*`                   |
| `faq`        | Frequently asked questions      | Embedded in other pages     |
| `features`   | Product feature descriptions    | `/features/[feature]`       |
| `handbook`   | Company handbook and culture    | `/handbook/*`               |
| `huddles`    | Community meeting notes         | `/community-huddle`         |
| `legal`      | Legal documents                 | `/legal/*`                  |
| `pages`      | Static and dynamic pages        | Various routes              |
| `pricing`    | Pricing tier information (JSON) | `/pricing`                  |

## Detailed Directory Structure

### `/about` - Company Information

```
about/
├── images/                    # Company and partner logos
│   ├── amplify.png
│   ├── cervin.png
│   ├── encoded.png
│   ├── highwinds.png
│   ├── illustration.png
│   ├── investors/             # Investor logos
│   ├── packet.png
│   ├── rock.png
│   ├── sf.png
│   ├── softlayer.png
│   ├── stackpath.png
│   ├── vine.png
│   ├── voxel.jpeg
│   ├── voxel.png
│   └── zscaler.png
├── index.mdx                  # Main about page
├── our-purpose.mdx           # Purpose statement
├── team.mdx                  # Team information
└── we-value.mdx              # Company values
```

**Route:** `/about`

### `/authors` - Blog Authors

```
authors/
├── assets/
│   └── images/               # Author profile photos
│       ├── alex.png
│       ├── chris.png
│       ├── felix.png
│       ├── jacob.png
│       ├── jose.png
│       ├── joshua.webp
│       ├── scot.webp
│       ├── steve.webp
│       ├── yahya.png
│       └── zac.png
├── alex.mdx                  # Individual author profiles
├── chris.mdx
├── fwidjaja.mdx
├── groupTeam.json            # Team grouping data
├── jacob-smith.mdx
├── jose.mdx
├── josh.mdx
├── scot.mdx
├── steve.mdx
├── yahya.mdx
└── zac-smith.mdx
```

**Routes:**

- `/authors` - Author listing
- `/authors/[author]` - Individual author page

### `/blog` - Blog Posts

```
blog/
├── assets/
│   └── images/               # Blog post images
│       ├── blog-1-thumb.png
│       ├── blog-1.png
│       ├── blog-2-thumb.png
│       ├── blog-2.png
│       ├── blog-3-thumb.png
│       └── blog-3.png
├── learning-from-dying-networks.mdx
├── open-source-strategy.mdx
└── the-network-stupid.mdx
```

**Routes:**

- `/blog` - Blog listing
- `/blog/[slug]` - Individual blog post

### `/categories` - Blog Categories

```
categories/
├── business-strategy.mdx
├── cloud-infrastructure.mdx
├── network-architecture.mdx
├── network-security.mdx
└── open-source.mdx
```

**Route:** `/blog/category/[category]`

### `/changelog` - Release Notes

```
changelog/
├── 0.0.1.md                  # Version release notes
├── 0.1.0.md
├── 0.1.1.md
└── index.md                  # Changelog index
```

**Route:** `/resources/changelog`

### `/docs` - Technical Documentation

```
docs/
└── docs/
    ├── alt-cloud/            # Alternative cloud docs (2 files)
    ├── api/                  # API documentation (8 files)
    │   ├── authenticating.mdx
    │   ├── connecting-to-the-api.mdx
    │   ├── index.mdx
    │   ├── locations.mdx
    │   ├── networks.mdx
    │   ├── resources.mdx
    │   └── workloads.mdx
    ├── assets/               # Asset management docs (3 files)
    ├── developer-guide.mdx
    ├── galactic-vpc/         # Galactic VPC docs (3 files)
    ├── glossary.mdx
    ├── guides/               # How-to guides (4 files)
    ├── guides.mdx
    ├── index.mdx
    ├── overview/             # Product overview (3 files)
    ├── platform/             # Platform docs (6 files)
    ├── quickstart/           # Getting started (5 files)
    ├── runtime/              # Runtime docs (4 files)
    ├── tasks/                # Task guides (1 file)
    ├── tutorials/            # Step-by-step tutorials (2 files)
    └── workflows/            # Workflow docs (3 files)
```

**Route:** `/docs/*` - Powered by Astro Starlight

### `/faq` - Frequently Asked Questions

```
faq/
├── builder-tier-free.mdx     # Builder tier questions
├── provider-tier.mdx         # Provider tier questions
├── scaler-launch.mdx         # Scaler tier questions
└── traffic-usage.mdx         # Traffic usage questions
```

**Usage:** Embedded in various pages (pricing, features, etc.)

### `/features` - Product Features

```
features/
├── 1-click-waf.md            # Web Application Firewall
├── agpl-license.md           # Licensing information
├── aws-gcp-byoc.md          # Bring Your Own Cloud
├── bring-your-ip-space.md   # IP space management
├── built-with-zero-trust.md # Zero trust architecture
├── datum-mcp.md             # Model Context Protocol
├── domains.md               # Domain management
├── enterprise-ready.md      # Enterprise features
├── grafana-cloud.md         # Grafana integration
├── index.mdx                # Features index
├── internet-edge.md         # Edge computing
├── kubernetes-friendly.md   # Kubernetes support
├── machine-accounts.md      # Machine authentication
├── network.md               # Network features
├── role-based-access-control.md  # RBAC
├── social-logins.md         # OAuth integrations
└── sso-support.md           # Single sign-on
```

**Routes:**

- `/features` - Features overview
- `/features/[feature]` - Individual feature page

### `/handbook` - Company Handbook

```
handbook/
├── assets/
│   └── sample.png
├── company/                  # Company information (15 files)
│   ├── deciding-what-products-to-build.md
│   ├── how-we-got-here.md
│   ├── how-we-make-money.md
│   ├── how-we-talk-to-each-other.md
│   ├── how-you-can-help.md
│   ├── our-ai-strategy.md
│   ├── our-neutral-strategy.md
│   ├── our-open-source-strategy.md
│   ├── our-values.md
│   ├── what-are-our-rituals.md
│   ├── what-inspires-us.md
│   ├── what-we-believe.md
│   ├── where-are-we-now.md
│   ├── who-are-we-building-for.md
│   └── why-we-exist.md
├── engineering/              # Engineering practices (6 files)
│   ├── ci-cd.md
│   ├── plan-cycles.md
│   ├── review-pull-requests.md
│   ├── rfc.md
│   ├── ship-new-features.md
│   └── tech-stack.md
├── go-to-market/            # GTM strategies (8 files)
│   ├── approach-gtm.md
│   ├── brand-voice-tone.md
│   ├── common-use-cases.md
│   ├── design-language.md
│   ├── design-principles.md
│   ├── keep-momentum.md
│   ├── our-website.md
│   └── swag.md
├── index.md                 # Handbook index
└── people/                  # People operations (8 files)
    ├── benefits.md
    ├── give-feedback.md
    ├── how-we-work.md
    ├── recognize-peers.md
    ├── remote-work.md
    ├── spend-money.md
    ├── titles.md
    └── travel-policy.md
```

**Routes:**

- `/handbook` - Handbook home
- `/handbook/*` - Handbook sections

### `/huddles` - Community Meetings

```
huddles/
├── 2024-12-04.mdx           # Monthly community huddle notes
├── 2025-01-15.mdx
├── 2025-02-12.mdx
├── 2025-03-12.mdx
├── 2025-04-09.mdx
├── 2025-05-14.mdx
├── 2025-06-11.mdx
├── 2025-07-09.mdx
├── 2025-08-13.mdx
├── 2025-09-10.mdx
├── 2025-10-08.mdx
├── 2025-11-12.mdx
└── 2025-12-11.mdx
```

**Route:** `/community-huddle`

### `/legal` - Legal Documents

```
legal/
├── privacy.mdx              # Privacy policy
└── terms.mdx                # Terms of service
```

**Routes:**

- `/legal/privacy`
- `/legal/terms`

### `/pages` - General Pages

```
pages/
├── assets/
│   ├── chat/                # Chat feature images (4 files)
│   └── home/                # Homepage assets (6 files)
├── blog.mdx                 # Blog landing page
├── brand/                   # Brand guidelines
│   ├── assets/              # Brand assets (34+ files)
│   ├── color.mdx
│   ├── iconography.mdx
│   ├── imagery.mdx
│   ├── index.mdx
│   ├── logos.mdx
│   ├── principles.mdx
│   ├── social.mdx
│   └── typography.mdx
├── community-huddle.mdx     # Community huddle landing
├── contact.mdx              # Contact page
├── docs.mdx                 # Documentation landing
├── global-section.md        # Shared content sections
├── home/
│   ├── images/              # Homepage images (36 files)
│   ├── what-does-good-look-like.md
│   └── why-evolve.md
├── home.mdx                 # Homepage content
├── pricing.mdx              # Pricing page content
├── request-access.mdx       # Access request form
├── resources/
│   ├── images/              # Resource images (8 files)
│   └── open-source.mdx      # Open source page
└── roadmap.mdx              # Product roadmap
```

**Various Routes:** Depends on content and page structure

### `/pricing` - Pricing Tiers

```
pricing/
├── free.json                # Free tier configuration
├── provider.json            # Provider tier configuration
└── scaler.json              # Scaler tier configuration
```

**Route:** `/pricing` (JSON data consumed by pricing page)

## Content Schemas

All collections are type-safe with schemas defined in `/src/content.config.ts`:

### Example: Blog Post Schema

```typescript
{
  title: string;           // Post title
  description: string;     // Meta description
  publishDate: Date;       // Publication date
  author: reference;       // Reference to author
  category: reference;     // Reference to category
  image?: ImageMetadata;   // Featured image
  tags?: string[];         // Post tags
}
```

### Example: Feature Schema

```typescript
{
  title: string;           // Feature name
  description: string;     // Short description
  icon?: string;          // Icon identifier
  category?: string;      // Feature category
}
```

## Adding New Content

### 1. Create a new file in the appropriate collection:

```bash
# Blog post
src/content/blog/my-new-post.mdx

# Feature
src/content/features/my-feature.md

# Handbook page
src/content/handbook/engineering/my-guide.md
```

### 2. Add frontmatter matching the schema:

```mdx
---
title: 'My New Post'
description: 'Post description'
publishDate: 2025-01-15
author: 'zac-smith'
category: 'network-architecture'
---

Your content here...
```

### 3. Add images to the appropriate assets folder:

```bash
src/content/blog/assets/images/my-image.png
```

### 4. Reference the content in pages:

```astro
---
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
---
```

## Content Guidelines

### File Naming

- Use kebab-case: `my-feature-name.mdx`
- Be descriptive and concise
- Match the slug used in URLs

### Frontmatter

- Required fields must be present
- Dates in ISO format: `YYYY-MM-DD`
- References must match existing collection entries
- Images should use relative paths

### Images

- Store in collection-specific `assets/` or `images/` folders
- Optimize images before committing
- Use descriptive filenames
- Provide alt text in markdown

### Content Style

- Use MDX for interactive components
- Keep markdown clean and semantic
- Use proper heading hierarchy (h2 → h3 → h4)
- Include meta descriptions for SEO

## Learn More

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [MDX Documentation](https://mdxjs.com/)
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Overall project structure

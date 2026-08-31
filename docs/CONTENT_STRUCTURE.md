# Content Structure

This document provides a detailed overview of the content organization in `src/content/`.

> Blog posts and author profiles are **not** stored here — they're sourced live from Strapi CMS via `src/libs/strapi/` (see `articles.ts`, `authors.ts`) and rendered by the `*Strapi.astro` components. This directory only holds locally-authored content collections.

```
src/content/
├── about/ (/about)
│   ├── images/
│   │   ├── about.png, amplify.png, cervin.png, encoded.png
│   │   ├── illustration.png, illustration-2.png, rock.png, sf.png, vine.png, voxel.jpeg
│   │   ├── companies/ (company logos)
│   │   └── investors/ (investor logos)
│   ├── companies.mdx
│   ├── index.mdx (main page)
│   ├── investors.mdx
│   ├── our-mission.mdx
│   ├── our-purpose.mdx
│   ├── team.mdx
│   └── we-value.mdx
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
├── events/ (/events)
│   ├── images/
│   │   ├── guests/
│   │   └── hosts/
│   └── <event-slug>/ (one directory per event, e.g. `04-2026-boston-alt-cloud-meetup-april-2026/`)
│
├── faq/
│   ├── builder-tier-free.mdx
│   ├── datum-infrastructure-structure.mdx
│   ├── datum-kubernetes-relationship.mdx
│   ├── how-does-datum-compare.mdx
│   ├── how-mature-is-datum.mdx
│   ├── internet-superpowers.mdx
│   ├── planned-deployment-models.mdx
│   ├── provider-tier.mdx
│   ├── scaler-launch.mdx
│   ├── traffic-usage.mdx
│   └── why-is-datum-free.mdx
│
├── features/ (/features)
│   └── placeholder.md
│
├── handbook/ (/about/handbook)
│   ├── about/ - About the company
│   ├── assets/ - Handbook images
│   ├── eos/ - Entrepreneurial Operating System (1-year plan, 3-year picture, VTO, rocks, scorecard)
│   ├── images/ - EOS model diagram
│   ├── operate/ - How the company operates day-to-day
│   ├── pay-perks/ - Compensation and perks
│   ├── policy/ - HR and security policies
│   ├── product/ - Product strategy (customers, fit, pricing, roadmap)
│   ├── teams/ - Team-specific handbook pages
│   └── index.md (main page)
│
├── images/
│   └── og/ - Open Graph images (about, blog, brand, community, contact, default, docs, handbook, home, pricing, product, roadmap)
│
├── legal/
│   ├── aup.mdx - Acceptable Use Policy
│   ├── privacy.mdx - Privacy policy
│   ├── service-country-specific-terms.mdx
│   ├── subprocessors.mdx
│   └── terms.mdx - Terms of service
│
├── pages/
│   ├── assets/ - Shared UI/illustration assets (chat/, home/, ui.png, ui.svg)
│   ├── brand/ - Brand guidelines (color, iconography, imagery, logos, principles, social, templates, typography) + assets/
│   ├── events/ - Events landing content (index, alt-cloud-meetups, community-huddles)
│   ├── home/ - Homepage sections (items.json, what-does-good-look-like.md, why-evolve.md) + images/
│   ├── resources/ - Open-source projects page + images/
│   ├── backlog.mdx, blog.mdx, career.mdx, contact.mdx, docs.mdx,
│   │   essentials.mdx, features.mdx, global-section.md, home.mdx (main page),
│   │   locations.mdx, pricing.mdx, roadmap.mdx
│
└── pricing/
    ├── free.json
    ├── provider.json
    └── scaler.json
```

## Content Organization

Each top-level directory (except `images/`) is registered as an Astro content collection in `src/content.config.ts`: `pages`, `about`, `legal`, `categories`, `handbooks`, `changelog`, `features`, `pricing`, `faq`, `events`.

### About (`about/`)

Company information pages: main about page, companies/investors, mission, purpose, team, and values — plus company/investor logos in `images/`.

### Careers (`careers/`)

Career page image only (`images/careers.png`). Job listings themselves come from Ashby via `src/libs/ashby.ts`.

### Categories (`categories/`)

Blog post category definitions used to tag Strapi-sourced blog posts.

### Changelog (`changelog/`)

Version changelog entries plus the main changelog index page.

### Events (`events/`)

One directory per event (community huddles, alt-cloud meetups), each with its own `index.mdx`. Shared guest/host photos live in `images/`.

### FAQ (`faq/`)

Frequently asked questions shown across marketing pages.

### Features (`features/`)

Currently just a placeholder file — feature page content is sourced elsewhere (see `src/data/features.json` and `src/components/features/`).

### Handbook (`handbook/`)

Company handbook organized by department/topic: `about/`, `eos/` (EOS — Entrepreneurial Operating System), `operate/`, `pay-perks/`, `policy/`, `product/`, `teams/`, plus shared `images/` and `assets/`.

### Images (`images/`)

Shared image assets — currently just Open Graph images in `og/`. Not a content collection.

### Legal (`legal/`)

Legal documents: AUP, privacy policy, subprocessors, country-specific terms, and terms of service.

### Pages (`pages/`)

Static/marketing page content that doesn't belong to a more specific collection — includes the homepage, brand guidelines, events landing pages, and standalone pages like `contact.mdx`, `pricing.mdx`, `roadmap.mdx`, `backlog.mdx`.

### Pricing (`pricing/`)

Pricing tier configurations (JSON): free, provider, scaler.

## File Naming Conventions

- **Content files**: kebab-case (e.g., `our-purpose.mdx`, `1-year-plan.md`)
- **Image files**: kebab-case or PascalCase
- **Changelog files**: version format (e.g., `0.1.0.md`)

## Content Types

- **MDX files** (`.mdx`) - content with component support (most pages, features index, legal, brand)
- **Markdown files** (`.md`) - standard markdown content (handbook, changelog)
- **JSON files** (`.json`) - structured data (pricing tiers, home page items)
- **Image files** - PNG, JPEG, WebP, SVG formats

# Project Structure

This document provides a comprehensive overview of the Datum Inc. website project structure.

## Root Directory Structure

```
.
├── src/            # Source code
├── public/         # Static files served as-is
├── config/         # Kubernetes deployment configuration
├── dist/           # Build output (generated)
├── tests/          # End-to-end tests
├── init/           # Database initialization scripts
├── scripts/        # Standalone maintenance scripts (SEO review, cache warmup)
├── templates/      # Code-generation templates (API docs)
├── .github/        # GitHub configuration and workflows
├── .vscode/        # VS Code settings
├── astro.config.mjs      # Astro configuration
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker build configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── eslint.config.mjs     # ESLint configuration
└── playwright.config.ts  # Playwright test configuration
```

## Source Code (`src/`)

### Actions (`src/actions/`)

Server-side actions for form submissions and API interactions:

- `index.ts` - Main actions export
- `demo.ts` - Book-a-demo form action (sends via `libs/mailer.ts`)
- `newsletter.ts` - Newsletter subscription actions

### Components (`src/components/`)

Reusable UI components organized by feature:

#### Core Components

- `Announcement.astro` - Announcement banner
- `ArticleNavigation.astro` - Article navigation
- `Aside.astro` - Aside component
- `Button.astro` - Button component
- `Card.astro` - Card component
- `CollectionEntryBody.astro` - Renders a content-collection entry body
- `Container.astro` - Container wrapper
- `FAQ.astro` - FAQ component
- `Favicons.astro` - Favicons component
- `Figure.astro` - Figure component
- `Footer.astro` / `FooterAiAgents.astro` - Site footer variants
- `GithubStargazerValue.astro` - GitHub stargazer counter
- `GlobalSection.astro` - Generic full-width section wrapper
- `GrafanaResourceGenerator.astro` / `GrafanaUrlGenerator.astro` - Grafana dashboard link generators
- `Header.astro` - Page header
- `Hero.astro` - Hero component
- `Icon.astro` - Icon component
- `JsonLd.astro` - JSON-LD structured data injector
- `LayoutEmbedScripts.astro` - Shared embed/analytics scripts
- `LogoDropdown.astro` - Logo dropdown menu
- `MarkdownLightbox.astro` / `MediaLightbox.astro` - Image/video lightbox
- `MobileMenu.astro` - Mobile navigation menu
- `Nav.astro` / `NavMenu.astro` - Site navigation
- `Pagination.astro` - Pagination component
- `PricingCard.astro` - Pricing card
- `SecondaryTabNav.astro` - Secondary tab navigation
- `TableOfContents.astro` - Table of contents component
- `TeamMemberCard.astro` - Team member card

#### Feature-Specific Components

**About** (`about/`)

- `Companies.astro` - Companies/investors component
- `Investors.astro` - Investors component
- `OurMission.astro` - Our mission component
- `People.astro` / `PeopleStrapi.astro` / `PeopleStrapiSkeleton.astro` - People listing (Strapi-backed) with loading skeleton
- `ProfileModal.astro` - Profile modal component
- `Team.astro` - Team component

**Blog** (`blog/`)

- `BlogItemStrapi.astro` - Individual blog post card (Strapi-backed)
- `BlogPagination.astro` - Blog pagination
- `BlogStrapi.astro` / `BlogStrapiSkeleton.astro` - Blog listing with loading skeleton
- `FeaturedPostStrapi.astro` - Featured blog post

**Brand** (`brand/`)

- `BrandCard.astro` / `BrandCardImage.astro` / `BrandCardText.astro` - Brand card and variants (used from `content/pages/brand/*.mdx`)
- `ColorPalette.astro` - Color palette display
- `NavBrand.astro` - Brand navigation

**Career** (`career/`)

- `Benefits.astro` - Career benefits component
- `Culture.astro` - Company culture component
- `JobList.astro` - Job listing component
- `Mission.astro` - Company mission component

**Changelog** (`changelog/`)

- `Card.astro` - Changelog card
- `Skeleton.astro` - Loading skeleton

**Content** (`content/`)

- `Note.astro` / `TabItem.astro` / `Tabs.astro` - MDX content primitives (callouts, tabbed content)
- `index.ts` / `tabs.ts` - Content component exports and tab logic

**Download** (`download/`)

- `Download.astro` - Download link/button
- `DownloadNav.astro` - Download page navigation

**Events** (`events/`)

- `Card.astro` - Event card component
- `CommunityHuddlePastModal.astro` - Past community huddle modal
- `EventBadge.astro` - Event status badge
- `EventCalendarSection.astro` - Event calendar section
- `EventCategoryCard.astro` - Event category card
- `EventPeople.astro` - Event speakers/attendees
- `EventSeriesCard.astro` - Event series card
- `Skeleton.astro` - Loading skeleton

**Features** (`features/`)

- `Cards.astro` - Feature cards
- `Table.astro` - Feature comparison table

**Forms** (`forms/`)

- `BookDemo.astro` - Book-a-demo form (submits via `actions/demo.ts`)
- `Contact.astro` - Contact form
- `NewsletterModal.astro` - Newsletter signup modal

**Handbook** (`handbook/`)

- `Article.astro` - Handbook article
- `EditPage.astro` - "Edit this page" link
- `LastUpdated.astro` - Last-updated timestamp
- `PageNav.astro` - Prev/next page navigation
- `Sidebar.astro` - Handbook sidebar

**Hello** (`hello/`)

- `HelloBehindCard.astro` / `HelloCard.astro` / `HelloHero.astro` - `/hello` landing page sections

**Home** (`home/`)

- `DatumPlatform.astro` - Platform overview section
- `DedicatedCloud.astro` - Dedicated cloud section
- `Hero.astro` / `HomeHero.astro` - Homepage hero
- `Mission.astro` - Mission section
- `Video.astro` - Video section
- `WhatIsDatum.astro` - "What is Datum" section

**Locations** (`locations/`)

- `LocationsList.astro` - Locations list
- `LocationsMap.astro` - Locations map

**Roadmap** (`roadmap/`)

- `RoadmapBacklog.astro` / `RoadmapBacklogRow.astro` - Backlog table
- `RoadmapCard.astro` - Roadmap card
- `RoadmapDetailContent.astro` - Roadmap detail page content
- `RoadmapGrid.astro` / `RoadmapRow.astro` - Roadmap listing layouts
- `RoadmapStrapi.astro` - Roadmap listing (Strapi-backed)
- `RoadmapViewFilter.astro` - Grid/list view filter

### Data (`src/data/`)

Static data files:

- `ai-prompt.md` - AI agent system prompt content
- `announcement.json` - Announcement banner config
- `downloads.json` - Download page entries
- `features.json` - Feature descriptions
- `locations.json` - Office/location data
- `logos.json` - Logo data
- `navigation.json` - Navigation structure
- `schemaOrgSite.ts` - Schema.org site data
- `siteConfig.json` - Site configuration

Content (`src/content/`)

Content files organized by content type. See [CONTENT_STRUCTURE.md](./CONTENT_STRUCTURE.md) for detailed content organization.

#### Main Content Directories

- `about/` - About page content and images
- `careers/` - Career content and assets
- `categories/` - Blog post categories
- `changelog/` - Changelog entries
- `download/` - Downloads content
- `events/` - Event entries
- `faq/` - Frequently asked questions
- `features/` - Feature descriptions
- `handbook/` - Company handbook
- `images/` - Shared images (OG, etc.)
- `legal/` - Legal documents
- `pages/` - Static page content
- `pricing/` - Pricing configuration (JSON)

Layouts (`src/layouts/`)

Page layout templates:

- `Layout.astro` - Default layout
- `LayoutMinimal.astro` - Minimal layout
- `LayoutSimple.astro` - Simple layout
- `NotFound.astro` - 404 page layout

Libraries (`src/libs/`)

Reusable utility libraries:

- `ashby.ts` - Ashby (careers) API client
- `auth.ts` - Authentication utilities
- `cache.ts` - Caching utilities
- `cacheApiAuth.ts` - Auth guard for cache API routes
- `cacheViewer.ts` - Cache inspection utilities
- `datum.ts` - Datum API client
- `events.ts` - Events data fetching/formatting
- `github.ts` - GitHub API client
- `githubBacklog.ts` - GitHub-backed roadmap backlog
- `githubRoadmap.ts` - GitHub milestones-backed roadmap content (replaces the old Strapi-sourced roadmap; see `docs/STRAPI_CACHE_API.md` for caching)
- `k8s-client.ts` - Kubernetes client
- `mailer.ts` - Email sending (used by `actions/demo.ts`)
- `oidc.ts` - OIDC authentication flow
- `postgres.ts` - Postgres client
- `safeRedirect.ts` - Restricts redirect targets to same-origin paths
- `string.ts` - String helpers
- `strapi/` - Strapi CMS client
  - `_runtime.ts` - Shared runtime helpers
  - `articles.ts` - Blog article queries
  - `authors.ts` - Author queries
  - `drivers/` - Cache driver backends (`redis.ts`, `resilient.ts`)
  - `graphqlPagination.ts` - GraphQL pagination helper
  - `httpCache.ts` - HTTP-level caching
  - `index.ts` - Strapi client exports
  - `regenerateCache.ts` - Cache regeneration (also drives force-regen for the GitHub-sourced roadmap/backlog caches, see `docs/STRAPI_CACHE_API.md`)
  - `resilientGraphqlClient.ts` - GraphQL client with retries
  - `drivers/` - Underlying transport drivers

### Pages (`src/pages/`)

File-based routes. Notable routes beyond the obvious top-level pages:

- `api/` - API routes
  - `api/auth/login.ts` - Login API endpoint
  - `api/user.ts` - User API endpoint
  - `api/cache/index.ts` / `api/cache/[name].ts` / `api/cache/strapi.ts` - Cache inventory (**GET**), single-key JSON (**GET** `/api/cache/:name`), Strapi regenerate (**POST**); see [STRAPI_CACHE_API.md](./STRAPI_CACHE_API.md)
  - `api/webhooks/strapi-content.ts` - Strapi content-change webhook
- `auth/` - `callback.astro`, `login.astro`, `logout.astro` - OIDC auth pages
- `blog/`, `authors/`, `roadmap/`, `download/` - Dynamic listing/detail pages, each with a matching `*.md.ts` markdown-export route
- `dev/` - `build.astro`, `info.astro` - Build status/info pages
- `demo.astro` - Book-a-demo page (renders `components/forms/BookDemo.astro`)
- `llms.txt.ts` / `llms-full.txt.ts` - LLMs.txt endpoints
- `rss.xml.js` / `sitemap.xml.ts` - Feed and sitemap endpoints

### Plugins (`src/plugins/`)

Astro/remark build plugins:

- `announcement.ts` - Announcement integration
- `remarkModifiedTime.mjs` - Modified-time remark plugin
- `sitemap.ts` - Sitemap plugin

### Types (`src/types/`)

TypeScript type definitions:

- `brand.ts` - Brand types
- `changelog.ts` - Changelog types
- `common.ts` - Common types
- `features.ts` - Feature types
- `form.ts` - Form types
- `k8s-resources.ts` - Kubernetes resource types
- `navigation.ts` - Navigation types
- `roadmap.ts` - Roadmap types
- `strapi.ts` - Strapi API response types
- `team.ts` - Team types

### Utils (`src/utils/`)

Utility functions:

- `authorUtils.ts` - Author utilities
- `blogPagination.ts` - Blog pagination helpers
- `collectionUtils.ts` - Collection utilities
- `dateUtils.ts` - Date utilities
- `expressiveCode.ts` / `expressiveCodeOptions.ts` - Code block rendering config
- `github.ts` - GitHub utilities
- `iconMap.ts` - Icon mapping
- `llmsUtils.ts` - LLMs utilities
- `markdownExport.ts` - Markdown export helpers
- `markdownFigure.ts` - Markdown figure rendering
- `markdownRegistry.ts` - Markdown component registry
- `pageMarkdown.ts` - Page-to-markdown rendering
- `string.ts` - String utilities
- `youtube.ts` - YouTube embed helpers

Static (`src/static/`)

Legacy static assets and styles:

- `assets/` - Legacy images, SVGs, and other assets
- `scripts/` - Legacy JavaScript files
- `styles/` - Legacy CSS files

Configuration Files

- `content.config.ts` - Content collection configuration
- `entrypoint.ts` - Application entry point
- `env.d.ts` - Environment types
- `global.d.ts` - Global types
- `middleware.ts` - Astro middleware

## Public Assets (`public/`)

Static files served as-is:

- `fonts/` - Web fonts
- `images/` - Static images
- `download/` - Downloadable assets
- `favicons/` - Favicon files
- `favicon.ico`, `favicon.png`, `favicon.svg` - Root favicons
- `site.webmanifest` - Web app manifest
- `robots.txt` - Robots directives
- `*.md` - Prerendered markdown exports of top-level pages (for `.md` fetches)

## Kubernetes Config (`config/`)

- `base/` - Deployment, service, HTTP route, and Redis kustomize base
- `gateway/` - Gateway API configuration (endpoint, gateway, HTTP routes, namespace, kustomization)

## Database Init (`init/`)

- `roadmap.sql` - Roadmap schema/seed script

## Scripts (`scripts/`)

- `seo-review.mjs` / `seo-review.config.json` - SEO review tooling
- `warmup-cache.ts` - Cache warmup script

## Templates (`templates/`)

- `api-docs/` - API documentation generation templates (`gv_details.tpl`, `gv_list.tpl`, `type.tpl`, `type_members.tpl`)

## Tests (`tests/`)

End-to-end tests using Playwright:

- `e2e/home.spec.ts` - Homepage tests
- `test-webhook.sh` - Manual webhook test script

## Build Output (`dist/`)

Generated build artifacts (not committed):

- `client/` - Client-side build output
- `server/` - Server-side build output

## Content Structure

For detailed content organization, see [CONTENT_STRUCTURE.md](./CONTENT_STRUCTURE.md).

## File Naming Conventions

- **Components**: PascalCase (e.g., `Button.astro`, `BlogItemStrapi.astro`)
- **Pages**: kebab-case or PascalCase (e.g., `index.astro`, `blog.astro`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`, `collectionUtils.ts`)
- **Types**: camelCase (e.g., `brand.ts`, `common.ts`)
- **Content**: kebab-case (e.g., `our-purpose.mdx`, `team.mdx`)

## Component Organization

Components are organized by feature/domain when they belong to a specific section of the site. Shared/common components are placed directly in `src/components/`.

## Routing

Astro uses file-based routing:

- Files in `src/pages/` automatically become routes
- `index.astro` files create index routes
- `_[...slug].astro` creates catch-all dynamic routes
- Folders create nested routes

# Project Structure

This document provides a comprehensive overview of the Datum Inc. website project structure.

## Root Directory Structure

```
.
├── src/                    # Source code
├── public/                 # Static files served as-is
├── config/                 # Kubernetes and deployment configuration
├── dist/                   # Build output (generated)
├── tests/                  # End-to-end tests
├── init/                   # Database initialization scripts
├── .github/                # GitHub configuration and workflows
├── .vscode/                # VS Code settings
├── astro.config.mjs        # Astro configuration
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker build configuration
├── package.json            # Project dependencies and scripts
├── tailwind.starlight.config.cjs  # Tailwind CSS configuration for Starlight
├── tsconfig.json           # TypeScript configuration
├── eslint.config.mjs       # ESLint configuration
├── playwright.config.ts    # Playwright test configuration
├── pagefind.yml            # Pagefind search configuration
└── starlight.d.ts          # Starlight TypeScript definitions
```

## Source Code (`src/`)

### Actions (`src/actions/`)

Server-side actions for form submissions and API interactions:

- `index.ts` - Main actions export
- `newsletter.ts` - Newsletter subscription actions
- `roadmap.ts` - Roadmap-related actions

### Components (`src/components/`)

Reusable UI components organized by feature:

#### Core Components

- `Button.astro` - Button component
- `Card.astro` - Card component
- `Container.astro` - Container wrapper
- `Icon.astro` - Icon component
- `Pagination.astro` - Pagination component
- `TableOfContents.astro` - Table of contents component

#### Layout Components

- `Header.astro` - Site header
- `Footer.astro` - Site footer
- `FooterDocs.astro` - Documentation footer
- `Nav.astro` - Navigation component
- `NavMenu.astro` - Navigation menu
- `MobileMenu.astro` - Mobile navigation menu
- `LogoDropdown.astro` - Logo dropdown menu
- `ThemeSelect.astro` - Theme selector

#### Feature-Specific Components

**About** (`about/`)

- `OurPurpose.astro`
- `Team.astro`
- `WeValue.astro`

**Blog** (`blog/`)

- `Blog.astro` - Blog listing page
- `BlogFilters.astro` - Blog filtering
- `BlogItem.astro` - Individual blog post card
- `BlogPagination.astro` - Blog pagination
- `FeaturedPost.astro` - Featured blog post

**Brand** (`brand/`)

- `BrandCard.astro` - Brand card component
- `BrandCardImage.astro` - Brand card image
- `BrandCardText.astro` - Brand card text
- `ColorPalette.astro` - Color palette display
- `NavBrand.astro` - Brand navigation

**Changelog** (`changelog/`)

- `Card.astro` - Changelog card
- `Skeleton.astro` - Loading skeleton

**Features** (`features/`)

- `Cards.astro` - Feature cards
- `Grids.astro` - Feature grid layout
- `Table.astro` - Feature comparison table

**Forms** (`forms/`)

- `Contact.astro` - Contact form
- `Signup.astro` - Signup form

**Handbook** (`handbook/`)

- `Article.astro` - Handbook article layout
- `PageNav.astro` - Page navigation
- `Sidebar.astro` - Handbook sidebar

**Home** (`home/`)

- `Hero.astro` - Homepage hero section
- `FirstSection.astro` - First section component
- `SecondSection.astro` - Second section component

**Huddles** (`huddles/`)

- `PreviousHuddle.astro` - Previous huddle display
- `UpcomingHuddle.astro` - Upcoming huddle display

**Roadmap** (`roadmap/`)

- `Card.astro` - Roadmap card
- `Skeleton.astro` - Loading skeleton

**Starlight** (`starlight/`)

- Custom Starlight theme components for documentation
- `Footer.astro`, `Header.astro`, `Sidebar.astro`, etc.

**Other Components**

- `ArticleNavigation.astro` - Article navigation
- `Aside.astro` - Aside component
- `FAQ.astro` - FAQ component
- `GlobalSection.astro` - Global section wrapper
- `GrafanaResourceGenerator.astro` - Grafana resource generator
- `GrafanaUrlGenerator.astro` - Grafana URL generator
- `GithubStargazerValue.astro` - GitHub stargazer counter
- `Hero.astro` - Hero component
- `PricingCard.astro` - Pricing card component
- `TeamMemberCard.astro` - Team member card

### Content (`src/content/`)

Content files organized by content type. See [CONTENT_STRUCTURE.md](./CONTENT_STUCTURE.md) for detailed content organization.

#### Main Content Directories

- `about/` - About page content and images
- `authors/` - Author profiles and assets
- `blog/` - Blog posts and assets
- `categories/` - Blog post categories
- `changelog/` - Changelog entries
- `docs/` - Documentation (Starlight)
- `faq/` - Frequently asked questions
- `features/` - Feature descriptions
- `handbook/` - Company handbook
- `huddles/` - Community huddle content
- `legal/` - Legal documents
- `pages/` - Static page content
- `pricing/` - Pricing configuration (JSON)

### Data (`src/data/`)

Static data files:

- `logos.json` - Logo data
- `navigation.json` - Navigation structure
- `siteConfig.json` - Site configuration

### Layouts (`src/layouts/`)

Page layout templates:

- `Layout.astro` - Default layout
- `LayoutMd.astro` - Markdown content layout
- `LayoutSimple.astro` - Simple layout
- `Handbook.astro` - Handbook layout
- `NotFound.astro` - 404 page layout

### Libraries (`src/libs/`)

Reusable utility libraries:

- `cache.ts` - Caching utilities
- `cookie.ts` - Cookie handling
- `datum.ts` - Datum API client
- `file.ts` - File utilities
- `github.ts` - GitHub API client
- `k8s-client.ts` - Kubernetes client
- `miloapi.ts` - Milo API client
- `oidc.ts` - OpenID Connect client
- `postgres.ts` - PostgreSQL client
- `string.ts` - String utilities
- `server/` - Server-side utilities
  - `glossary.ts` - Glossary utilities
  - `sitemap.ts` - Sitemap generation

### Pages (`src/pages/`)

Page components and routing (file-based routing):

- `index.astro` - Homepage
- `404.astro` - 404 error page
- `_[...slug].astro` - Catch-all route for dynamic pages
- `about/` - About pages
- `api/` - API endpoints
- `auth/` - Authentication pages
- `authors/` - Author pages
- `blog/` - Blog pages
- `blog.astro` - Blog listing
- `brand/` - Brand pages
- `community-huddle.astro` - Community huddle page
- `contact.astro` - Contact page
- `features/` - Feature pages
- `handbook/` - Handbook pages
- `handbook.astro` - Handbook listing
- `legal/` - Legal pages
- `pricing.astro` - Pricing page
- `request-access.astro` - Request access page
- `resources/` - Resource pages
- `waitlist.astro` - Waitlist page
- `llms.txt.ts` - LLMs.txt endpoint
- `llms-full.txt.ts` - Full LLMs.txt endpoint

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
- `team.ts` - Team types

### Utils (`src/utils/`)

Utility functions:

- `collectionUtils.ts` - Collection utilities
- `dateUtils.ts` - Date utilities
- `envLogger.ts` - Environment logger
- `file.ts` - File utilities
- `github.ts` - GitHub utilities
- `iconMap.ts` - Icon mapping
- `imageUtils.ts` - Image utilities
- `roadmap.ts` - Roadmap utilities

### Legacy (`src/v1/`)

Legacy v1 assets and styles:

- `assets/` - Legacy images, SVGs, and other assets
- `scripts/` - Legacy JavaScript files
- `styles/` - Legacy CSS files

### Configuration Files

- `content.config.ts` - Content collection configuration
- `entrypoint.ts` - Application entry point
- `env.d.ts` - Environment type definitions
- `middleware.ts` - Astro middleware

## Public Assets (`public/`)

Static files served as-is:

- `fonts/` - Web fonts
- `images/` - Static images
- `scripts/` - Client-side scripts
- `download/` - Downloadable assets
- `favicon.ico`, `favicon.png`, `favicon.svg` - Favicons
- `site.webmanifest` - Web app manifest
- `apple-touch-icon.png` - Apple touch icon
- Brand logos (SVG files)

## Configuration (`config/`)

Kubernetes and deployment configuration:

- `base/` - Base Kubernetes manifests
  - `deployment.yaml` - Deployment configuration
  - `service.yaml` - Service configuration
  - `http-route.yaml` - HTTP route configuration
  - `kustomization.yaml` - Kustomize configuration
- `dev/` - Development environment configuration
  - `postgres-config.yaml` - PostgreSQL configuration
  - `postgres-values.yaml` - PostgreSQL Helm values
- `gateway/` - Gateway configuration
  - `endpoint.yaml` - Endpoint configuration
  - `gateway.yaml` - Gateway configuration
  - `httproute.yaml` - HTTP route
  - `httproute-redirect.yaml` - HTTP redirect route
  - `kustomization.yaml` - Kustomize configuration
  - `namespace.yaml` - Namespace configuration

## Tests (`tests/`)

End-to-end tests using Playwright:

- `e2e/` - End-to-end test files
  - `home.spec.ts` - Homepage tests

## Build Output (`dist/`)

Generated build artifacts (not committed):

- `client/` - Client-side build output
- `server/` - Server-side build output

## Content Structure

For detailed content organization, see [CONTENT_STRUCTURE.md](./CONTENT_STUCTURE.md).

## File Naming Conventions

- **Components**: PascalCase (e.g., `Button.astro`, `BlogItem.astro`)
- **Pages**: kebab-case or PascalCase (e.g., `index.astro`, `blog.astro`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`, `imageUtils.ts`)
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

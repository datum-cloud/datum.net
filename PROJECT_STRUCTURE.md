# Project Structure

This document provides an overview of the Datum Inc. website project structure and organization.

## Directory Overview

```
.
├── src/                # Source code
│   ├── actions/        # Server actions for forms and API interactions
│   ├── assets/         # Static assets (images, fonts, etc.)
│   ├── components/     # Reusable UI components
│   │   ├── about/      # About page components
│   │   ├── auth/       # Authentication components
│   │   ├── blog/       # Blog-specific components
│   │   ├── brand/      # Brand assets and components
│   │   ├── changelog/  # Changelog components
│   │   ├── features/   # Feature showcase components
│   │   ├── forms/      # Form components
│   │   ├── handbook/   # Handbook components
│   │   ├── home/       # Homepage components
│   │   ├── huddles/    # Community huddle components
│   │   ├── roadmap/    # Roadmap components
│   │   └── starlight/  # Documentation (Starlight) components
│   ├── content/        # MDX content files
│   │   ├── about/      # About page content
│   │   ├── authors/    # Author profiles
│   │   ├── blog/       # Blog posts
│   │   ├── categories/ # Content categories
│   │   ├── changelog/  # Release notes and changelog
│   │   ├── docs/       # Documentation pages
│   │   ├── faq/        # Frequently asked questions
│   │   ├── features/   # Feature descriptions
│   │   ├── handbook/   # Company handbook
│   │   ├── huddles/    # Community huddle notes
│   │   ├── legal/      # Legal documents (privacy, terms)
│   │   ├── pages/      # Static pages content
│   │   └── pricing/    # Pricing tier information
│   ├── data/           # Static data files (JSON)
│   │   ├── logos.json         # Logo assets configuration
│   │   ├── navigation.json    # Navigation structure
│   │   └── siteConfig.json    # Site-wide configuration
│   ├── layouts/        # Page layouts and templates
│   │   ├── Handbook.astro     # Handbook layout
│   │   ├── Layout.astro       # Main layout
│   │   ├── LayoutMd.astro     # Markdown content layout
│   │   ├── LayoutSimple.astro # Simplified layout
│   │   └── NotFound.astro     # 404 page layout
│   ├── libs/           # Library integrations and utilities
│   │   ├── cache.ts           # Caching utilities
│   │   ├── cookie.ts          # Cookie management
│   │   ├── datum.ts           # Datum API integration
│   │   ├── file.ts            # File utilities
│   │   ├── github.ts          # GitHub API integration
│   │   ├── k8s-client.ts      # Kubernetes client
│   │   ├── miloapi.ts         # Milo API integration
│   │   ├── oidc.ts            # OIDC authentication
│   │   ├── postgres.ts        # PostgreSQL database
│   │   ├── string.ts          # String utilities
│   │   └── server/            # Server-side utilities
│   ├── pages/          # Page components and routing
│   │   └── api/        # API endpoints
│   ├── styles/         # Global styles and CSS
│   ├── types/          # TypeScript type definitions
│   │   ├── brand.ts           # Brand-related types
│   │   ├── changelog.ts       # Changelog types
│   │   ├── common.ts          # Common shared types
│   │   ├── features.ts        # Feature types
│   │   ├── form.ts            # Form types
│   │   ├── k8s-resources.ts   # Kubernetes resource types
│   │   ├── navigation.ts      # Navigation types
│   │   ├── roadmap.ts         # Roadmap types
│   │   └── team.ts            # Team member types
│   ├── utils/          # Utility functions and helpers
│   │   ├── collectionUtils.ts # Content collection helpers
│   │   ├── dateUtils.ts       # Date formatting utilities
│   │   ├── envLogger.ts       # Environment logging
│   │   ├── file.ts            # File operations
│   │   ├── github.ts          # GitHub utilities
│   │   ├── iconMap.ts         # Icon mapping
│   │   ├── imageUtils.ts      # Image processing
│   │   └── roadmap.ts         # Roadmap utilities
│   ├── v1/             # Legacy v1 assets and styles
│   │   ├── assets/     # Legacy images and media
│   │   ├── scripts/    # Legacy JavaScript
│   │   └── styles/     # Legacy CSS
│   ├── content.config.ts      # Content collection configuration
│   ├── entrypoint.ts          # Application entry point
│   ├── env.d.ts               # Environment type definitions
│   └── middleware.ts          # Astro middleware
├── public/             # Static files served as-is
│   ├── download/       # Downloadable assets
│   ├── fonts/          # Web fonts
│   ├── images/         # Static images
│   ├── scripts/        # Third-party scripts
│   ├── favicon.ico     # Favicon
│   └── site.webmanifest # PWA manifest
├── config/             # Deployment configuration files
│   ├── base/           # Base Kubernetes config
│   ├── dev/            # Development environment config
│   └── gateway/        # API Gateway configuration
├── tests/              # Test files
│   └── e2e/            # End-to-end tests
├── .github/            # GitHub configuration and workflows
├── .vscode/            # VS Code settings
├── astro.config.mjs    # Astro configuration
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Docker build configuration
├── eslint.config.mjs   # ESLint configuration
├── package.json        # Project dependencies and scripts
├── playwright.config.ts # Playwright testing configuration
├── tailwind.config.mjs # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Key Directories Explained

### `/src/components`

Reusable UI components organized by feature or page area. Each subdirectory contains related components:

- Atomic components (buttons, cards, etc.) at the root level
- Feature-specific components in subdirectories
- Shared components used across multiple pages

### `/src/content`

Content collections managed by Astro's content layer. All MDX files are type-safe and validated:

- Blog posts with frontmatter metadata
- Documentation pages with navigation
- Author profiles and team information
- Legal documents and static pages

### `/src/libs`

Third-party integrations and service clients:

- Database connections
- API clients (GitHub, Kubernetes, etc.)
- Authentication providers
- Caching and utilities

### `/src/pages`

File-based routing powered by Astro. Each file becomes a route:

- `.astro` files for server-rendered pages
- `.ts` files for API endpoints
- Supports dynamic routes with `[param]` syntax

### `/src/v1`

Legacy assets from previous version:

- Maintained for backward compatibility
- Gradual migration to new architecture
- Will be deprecated in future releases

## Configuration Files

| File                   | Purpose                       |
| :--------------------- | :---------------------------- |
| `astro.config.mjs`     | Astro framework configuration |
| `tailwind.config.mjs`  | Tailwind CSS design system    |
| `tsconfig.json`        | TypeScript compiler options   |
| `eslint.config.mjs`    | Code linting rules            |
| `playwright.config.ts` | E2E testing configuration     |
| `docker-compose.yml`   | Local development environment |
| `Dockerfile`           | Production container build    |

## Content Collections

The project uses Astro's Content Collections for type-safe content management:

```typescript
// Defined in src/content.config.ts
- authors      # Author profiles
- blog         # Blog posts
- docs         # Documentation
- changelog    # Release notes
- features     # Product features
- handbook     # Company handbook
- huddles      # Community meetings
```

Each collection has a defined schema ensuring content consistency.

## Development Patterns

### Component Organization

- One component per file
- Use `.astro` for components with markup
- Use `.ts` for utility functions and types
- Props interfaces defined at file top

### Styling Approach

- Tailwind CSS for utility-first styling
- CSS modules for component-specific styles
- Global styles in `/src/v1/styles` (legacy)
- Design tokens in Tailwind config

### Type Safety

- All content collections have TypeScript schemas
- API responses typed with interfaces
- Props validated at build time
- Strict TypeScript configuration

## Build Output

The build process generates:

- `/dist/client` - Static assets and HTML
- `/dist/server` - Server-side rendering code
- `/public/pagefind` - Search index

## Learn More

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS](https://tailwindcss.com)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)

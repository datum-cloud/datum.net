# GitHub Copilot Instructions for datum.net

## Project Overview

This is the official Datum Inc. marketing website - an Astro-based static site with SSR capabilities, built with TypeScript, Tailwind CSS v4, and AlpineJS. The site serves multiple purposes: marketing pages, documentation (via Starlight), blog, handbook, changelog, and interactive features like roadmap voting.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS v4, AlpineJS, Starlight, Postgres, MDX

## Architecture & Key Patterns

### Content Collections Architecture

The site uses Astro's Content Collections extensively (`src/content.config.ts`). All content is type-safe with Zod schemas:

- **Collections:** `pages`, `about`, `blog`, `authors`, `categories`, `handbooks`, `changelog`, `features`, `docs`
- **Pattern:** Use `getCollectionEntry()` helper from `@utils/collectionUtils` instead of raw `getEntry()` - it provides better error handling
- **Loaders:** Content uses `glob` loaders, docs use `docsLoader()` from Starlight
- **References:** Collections can reference each other via `reference('collectionName')`

Example:

```typescript
const page = await getCollectionEntry('pages', 'pricing');
const features = await getCollection('features');
```

### Import Path Aliases (tsconfig.json)

Always use path aliases for imports:

- `@components/*` - UI components
- `@layouts/*` - Page layouts
- `@utils/*` - Utility functions
- `@libs/*` - Library code (datum, github, postgres, oidc)
- `@content/*` - Content files
- `@data/*` - JSON data files
- `@v1/*` - Legacy styles/components

### Component Patterns

**Astro Components:**

- Use `.astro` extension for templating
- Props are accessed via `Astro.props`
- Use `class` prop (not `className`) for styling: `Astro.props.class`
- Middleware provides `Astro.locals` (e.g., `Astro.locals.starCount()`)

**AlpineJS Integration:**

- Interactive components use `x-data`, `x-show`, `x-if`, `@click` directives
- AlpineJS initialized in `src/entrypoint.ts` with `@alpinejs/collapse` plugin
- Common pattern: `x-data="{ open: false }"` for toggle states
- Use `x-collapse` for expandable sections (see `handbook/Sidebar.astro`)

### Starlight Documentation

The `/docs` route is powered by Starlight with heavy customization:

- Override components in `src/components/starlight/`
- Custom sidebar, header, footer, search components
- Access Starlight context: `Astro.locals.starlightRoute` (has `hasSidebar`, `toc`, `sidebar`)
- Translations: `Astro.locals.t('search.label')`
- Glossary plugin: `@libs/server/glossary.js`

### Actions (Server Functions)

Astro Actions in `src/actions/` provide type-safe server endpoints:

```typescript
import { defineAction } from 'astro:actions';
import { z } from 'astro:content';

export const vote = defineAction({
  input: z.object({ userId: z.string(), issueId: z.string() }),
  handler: async (input) => {
    /* ... */
  },
});
```

Used for roadmap voting, OIDC authentication, etc.

### Database Integration

- **Postgres:** Connection management in `src/libs/postgres.ts`
- Lazy connection: `dbConnect()` creates connection on first use
- Tables: `votes`, `issues`, `user_votes`
- Always use environment variables: `import.meta.env.POSTGRES_USER || process.env.POSTGRES_USER`

### External Integrations

**GitHub API:** `src/libs/github.ts` and `src/libs/datum.ts`

- Fetch stargazer count (cached in middleware)
- Roadmap issues from `datum-cloud/enhancements` repo
- Changelogs from GitHub Discussions
- Uses `octokit` library with GraphQL queries

**OIDC Authentication:** `src/libs/oidc.ts`

- OpenID Connect client for Datum platform integration
- PKCE flow for authorization
- Environment vars: `AUTH_OIDC_ISSUER`, `AUTH_OIDC_CLIENT_ID`, etc.

### Caching Strategy

File-based caching in `src/libs/cache.ts`:

```typescript
const cache = new Cache('.cache');
if (cache.has('key')) return cache.get('key');
cache.set('key', value, ttl); // ttl in milliseconds
```

Used for GitHub API responses (5-10 min TTL)

## Development Workflow

### Commands

```bash
npm run dev              # Dev server at localhost:4321
npm run build            # Production build + Pagefind indexing
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run lint:md:fix      # Fix markdown issues (MDX in src/content/)
npm run format           # Prettier formatting
npm run test:e2e         # Playwright E2E tests
```

### Critical Build Steps

1. Must run `npm run build` once before dev to generate Pagefind search indices
2. Pagefind indexes: main site (`dist/pagefind`) and blog-only (`dist/pagefind-blog`)
3. Dev mode copies these to `public/` directory

### Environment Variables

- Always check both `process.env.VAR` AND `import.meta.env.VAR`
- Pattern: `process.env.SITE_URL || import.meta.env.SITE_URL || 'fallback'`
- See `.env.example` for required vars

### Markdown/MDX Content

**Linting:** Relaxed markdownlint rules (`.markdownlint.json`)

- Allows inline HTML/JSX (MD033) for MDX components
- No line length limits (MD013)
- Flexible for React/Astro component integration

**Front matter schemas:** Defined in `src/content.config.ts` with Zod

- Required: `title`
- Common: `description`, `date`, `slug`, `order`, `draft`, `meta` (SEO)

## Code Quality

### ESLint Configuration

- Flat config format (`eslint.config.mjs`)
- TypeScript, Astro, MDX support
- **Accessibility:** Most jsx-a11y rules disabled (intentional for marketing site)
- Ignores: `dist/`, `public/pagefind*/`, `src/content/`

### TypeScript

- Strict mode enabled
- Use `Astro.props as TypeName` for component props
- Types in `src/types/` (e.g., `common.ts` has `LayoutProps`)

### Styling

- **Tailwind CSS v4:** Config in `tailwind.starlight.config.cjs` (Starlight-specific)
- Vite plugin: `@tailwindcss/vite`
- No preflight for Starlight pages (`corePlugins: { preflight: false }`)
- Custom styles in `src/v1/styles/`

## Docker & Deployment

Multi-stage Dockerfile:

- **Development:** Hot-reload, mounted source, port 4321
- **Production:** Optimized build, standalone Node server
- Entry point: `dist/server/entry.mjs` (SSR mode with `@astrojs/node` adapter)
- Environment: Alpine Linux, Node 24

Kubernetes configs in `config/` (base, dev, gateway)

## Common Pitfalls

1. **Pagefind Search:** Must build once before dev mode works
2. **Content Collections:** Always await `getCollection()` / `getCollectionEntry()`
3. **AlpineJS:** Components need `x-data` to initialize Alpine context
4. **Middleware:** `Astro.locals` only available after middleware runs
5. **Images:** Use `image()` in schemas, not plain strings for local images
6. **Trailing Slashes:** Configured as `always` in `astro.config.mjs`
7. **Routes:** Dynamic routes use `[slug].astro` or `[...slug].astro` patterns

## File Organization

- `src/pages/` - File-based routing
- `src/components/` - Organized by feature (blog/, handbook/, starlight/, etc.)
- `src/content/` - MDX content collections
- `src/libs/` - Reusable libraries (github, postgres, oidc, cache)
- `src/utils/` - Helper functions (dateUtils, imageUtils, collectionUtils)
- `src/actions/` - Server actions (vote, auth)
- `public/` - Static assets (fonts, images, scripts)

## Testing

Playwright for E2E testing:

- Tests in `tests/e2e/`
- Reports in `playwright-report/` (gitignored)
- CI-configured with retries and screenshots on failure

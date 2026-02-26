# datum.net Project Rules

## Stack
- **Framework**: Astro 5.x + TypeScript strict mode
- **Styling**: TailwindCSS v4 with CSS layers
- **Interactivity**: Alpine.js
- **Testing**: Playwright (E2E)

## File Naming
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BlogItem.astro`, `NavMenu.astro` |
| Utils | camelCase + suffix | `dateUtils.ts`, `imageUtils.ts` |
| Libs | camelCase | `string.ts`, `postgres.ts` |
| Types | camelCase | `common.ts`, `navigation.ts` |
| Pages | kebab-case | `request-access.astro` |
| CSS | kebab-case + prefix | `components-blog.css`, `page-home.css` |

## CSS Class Naming (BEM-like)
- **Single dash (-)**: children/elements → `nav-menu-item`, `content-title`
- **Double dash (--)**: variants/modifiers → `content-image--left`, `blog-featured--title`

## Critical Rules
1. **No inline styles** - All styles go in CSS files under `src/v1/styles/`
2. **No inline Tailwind classes** - Put Tailwind in CSS with `@apply`
3. **No arbitrary values** - Check `@theme` layer for variables
4. **Start components with path comment** → `// src/components/Button.astro`
5. **Use path aliases** → `@components/*`, `@utils/*`, `@libs/*`, `@types/*`, `@v1/*`

## CSS Organization
```
src/v1/styles/
  base.css          # Base styles
  theme.css         # Theme variables
  variables.css     # CSS custom properties
  utilities.css     # Global utilities
  components-*.css  # Component styles
  page-*.css        # Page-specific styles
```

## Astro Patterns
```astro
---
// src/components/Example.astro
import type { ExampleProps } from '@types/common';

const { class: className = '', prop1, prop2 = 'default' } = Astro.props as ExampleProps;
---
<div class:list={['base-class', condition && 'conditional-class']}></div>
```

## Import Order
1. Astro imports
2. Local imports
3. Types (use `import type`)

## Formatting
- Single quotes, semicolons required
- 2-space indent, 100 char width
- Trailing commas (ES5)

See [detailed-rules.md](./detailed-rules.md) for full conventions.

# Detailed Project Rules for datum.net

## TypeScript Conventions

### Type Safety
- Use `strict` TypeScript config (extends `astro/tsconfigs/strict`)
- Prefer `@ts-expect-error` over `@ts-ignore`
- Prefix unused variables with `_` (e.g., `_unusedParam`)
- Use `const` assertions: `as const`
- Explicit return types for public functions

### JSDoc Pattern
```typescript
/**
 * Brief description of function purpose
 * @param paramName - Description of parameter
 * @returns Description of return value
 */
export const functionName = (paramName: Type): ReturnType => {
  // implementation
};
```

### Path Aliases
| Alias | Path |
|-------|------|
| `@/*` | root |
| `@components/*` | `./src/components/*` |
| `@utils/*` | `./src/utils/*` |
| `@libs/*` | `./src/libs/*` |
| `@types/*` | `./src/types/*` |
| `@layouts/*` | `./src/layouts/*` |
| `@v1/*` | `./src/v1/*` |
| `@content/*` | `./src/content/*` |
| `@data/*` | `./src/data/*` |
| `@styles/*` | `./src/styles/*` |
| `@assets/*` | `./src/assets/*` |

## TailwindCSS v4 Rules

### DO
- Use `@layer components` for component styles
- Use `@apply` directive for Tailwind utilities
- Use nested SCSS format
- Check `@theme` for existing variables before adding custom values

### DON'T
- No arbitrary values like `w-[123px]`
- No inline Tailwind classes in components
- No `<style>` tags in components

### CSS File Pattern
```css
@layer components {
  .component-name {
    @apply flex items-center gap-4;

    &--variant {
      @apply bg-blue-500;
    }

    &-child {
      @apply text-sm;
    }
  }
}
```

## Astro Component Rules

### Required Structure
1. Start with path comment
2. Imports in frontmatter
3. Props interface with destructuring
4. Clean template with `class:list`

### Props Pattern
```astro
---
// src/components/ComponentName.astro
import type { ComponentProps } from '@types/common';
import '@v1/styles/components-feature.css';

const {
  class: className = '',
  requiredProp,
  optionalProp = 'default',
  ...restProps
} = Astro.props as ComponentProps;
---

<div class:list={['component-name', className]} {...restProps}>
  {/* content */}
</div>
```

### Conditional Rendering
```astro
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
```

## Server Actions

- Use `defineAction` from `astro:actions`
- Validate with Zod
- Return appropriate HTTP status codes
- Handle errors with try/catch

## Performance

- Use `server:defer` for non-critical components
- Use Astro's `Image` component for images
- Add `data-astro-prefetch="hover"` for link prefetching
- Prefer SSR over client-side JS

## Figma Dev Mode

- Use localhost source directly for images/SVGs from Figma MCP
- Do NOT import new icon packages - use Figma assets
- Do NOT create placeholders if localhost source provided

## Project Structure
```
src/
  components/      # PascalCase, grouped by feature
    blog/
    forms/
    home/
  pages/           # kebab-case routes
  utils/           # camelCase + suffix
  libs/            # camelCase, library code
  types/           # TypeScript definitions
  actions/         # Server actions
  layouts/         # Layout components
  content/         # MDX/MD collections
  v1/
    styles/        # All CSS files
    assets/        # Images, SVGs, icons
```

## Code Quality Checklist
- [ ] Comments describe purpose, not effect
- [ ] No commented-out code
- [ ] Type safety maintained
- [ ] Semantic HTML used
- [ ] Accessibility attributes included
- [ ] ESLint/Prettier clean

# V1 Template Development Guide

## Overview

The v1 template system allows you to develop new designs without affecting the current website. This is perfect for converting Figma designs to HTML while keeping the existing site running.

## Structure

```
src/
├── v1/                           # v1 template module
│   ├── components/               # v1-specific components
│   │   ├── home/                 # Home page components
│   │   │   ├── HeroSection.astro # Hero section component
│   │   │   ├── GoodLookSection.astro # Good look section
│   │   │   ├── EvolveSection.astro # Evolve section
│   │   │   └── OpenNetwork.astro # Open network section
│   │   ├── Nav.astro            # Navigation component
│   │   ├── Icon.astro           # Reusable icon component
│   │   ├── MobileMenu.astro     # Mobile navigation menu
│   │   └── Footer.astro         # Footer component
│   ├── layouts/
│   │   └── Layout.astro          # v1 template layout
│   ├── styles/
│   │   ├── global.css            # v1-specific styles
│   │   ├── theme.css             # Design system variables
│   │   ├── fonts.css             # Custom font imports
│   │   ├── components.css        # Component styles
│   │   ├── utilities.css         # Utility classes
│   │   └── home.css              # Home page specific styles
│   ├── scripts/                  # JavaScript files
│   │   ├── desktop-nav.js        # Desktop navigation logic
│   │   ├── mobile-nav.js         # Mobile navigation logic
│   │   └── lenis-parallax.js     # Parallax scrolling effects
│   └── assets/                   # v1-specific assets
│       ├── images/               # Images and illustrations
│       ├── icons/                # Icon SVGs
│       ├── svgs/                 # SVG components
│       └── logos/                # Partner logos
├── utils/                        # Shared utilities
│   └── iconMap.ts               # Icon mapping utility
├── data/                         # Content data
│   └── navigation.json           # Navigation structure
├── types/                        # TypeScript type definitions
│   ├── navigation.ts             # Navigation types
│   ├── common.ts                 # Common types
│   └── team.ts                   # Team member types
└── pages/
    └── v1/                       # v1 page routes
        ├── index.astro           # Redirects to /v1/home
        ├── home.astro            # /v1/home
        ├── blog.astro            # /v1/blog
        └── products.astro        # /v1/products
```

## Development Workflow

### 1. Start Development Server

```bash
# Run the development server
npm run dev
```

### 2. Access v1 Template

- **Home**: http://localhost:4321/v1/home
- **Blog**: http://localhost:4321/v1/blog
- **Products**: http://localhost:4321/v1/products

### 3. Development Guidelines

#### Component Organization

- Use `src/v1/components/` for v1-specific components
- Create reusable components like `Nav.astro` and `Icon.astro`
- Import components using `@v1/components/` path mapping

#### CSS Organization

- Use `src/v1/styles/global.css` for v1-specific styles
- Use `src/v1/styles/theme.css` for design system variables
- Use Tailwind classes with `@apply` directives in global CSS
- Use clean class names without prefixes (e.g., `.hero`, `.card`, `.products`)
- No inline `<style>` tags - all styles go in global CSS

#### Icon System

- Use `src/utils/iconMap.ts` for centralized icon management
- Import Lucide icons and map them to kebab-case names
- Use `<Icon name="icon-name" size="md" />` component
- Add new icons to iconMap.ts when needed

#### Navigation System

- Use `src/data/navigation.json` for navigation structure
- Support dropdowns and mega dropdowns
- Dynamic icon loading from navigation data
- Responsive design with mobile considerations

#### Content Reuse

- Reuse existing content collections (blog, authors, etc.)
- Same data, different presentation
- No content duplication needed

#### Layout Structure

- `src/v1/layouts/Layout.astro` is the base layout
- Minimal structure for Figma-to-HTML conversion
- Include navigation and other components as needed

## Converting Figma Designs

### 1. Create New Pages

```bash
# Create new v1 page route
touch src/pages/v1/your-page.astro
```

### 2. Use v1 Layout

```astro
---
import Layout from '@v1/layouts/Layout.astro';
---

<Layout title="Your Page" description="Description">
  <!-- Your Figma-converted HTML here -->
</Layout>
```

### 3. Add Custom Styles

```css
/* In src/v1/styles/global.css */
.your-component {
  @apply rounded-lg border border-gray-200 bg-white p-6 shadow-md;
}
```

## File Organization Benefits

### Advantages of `/v1/` Structure

1. **Complete Isolation**: All v1 files are contained in one directory
2. **Easy Migration**: Can easily move entire v1 module to production
3. **Clear Separation**: No confusion between current and v1 templates
4. **Modular Development**: Work on v1 as a separate module
5. **Simple Cleanup**: Easy to remove v1 if not needed

### Development Workflow

1. **Page Development**: Create routes in `src/pages/v1/`
2. **Styling**: Add styles to `src/v1/styles/global.css`
3. **Layout**: Modify `src/v1/layouts/Layout.astro`

## Path Mapping

The `@v1/*` path mapping is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@v1/*": ["./src/v1/*"]
    }
  }
}
```

This allows you to import v1 components like:

```astro
import Layout from '@v1/layouts/Layout.astro';
```

# Contributing to Datum Inc. Website

Thank you for your interest in contributing to the Datum Inc. website! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots if applicable
- Environment details (browser, OS, Node.js version)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:

- A clear description of the feature
- Use cases and benefits
- Any mockups or examples if available

### Pull Requests

1. **Fork the repository** and create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:

   ```bash
   npm run typecheck
   npm run lint
   npm run test:e2e
   ```

4. **Commit your changes** using our commit message conventions (see below)

5. **Push to your fork** and create a pull request

6. **Ensure all checks pass** - CI will run type checking, linting, and tests

## Development Setup

### Prerequisites

- Node.js (version specified in `package.json`)
- npm or compatible package manager

### Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-org/datum.net.git
   cd datum.net
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build for pagefind** (required for dev mode):

   ```bash
   npm run build
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The site will be available at `http://localhost:4321`

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Follow strict TypeScript rules
- Use `@ts-expect-error` instead of `@ts-ignore` when suppressing errors
- Define types in `src/types/` for reusable types

### Astro Components

- Use PascalCase for component file names
- Keep components focused and reusable
- Use TypeScript for component scripts
- Follow Astro best practices for component structure

### CSS and Styling

- Use Tailwind CSS for styling
- Use `--` as the separator in CSS class names (not `__`)
- Follow mobile-first responsive design principles
- Keep styles scoped to components when possible

### File Organization

- Place components in `src/components/` organized by feature
- Place utilities in `src/utils/`
- Place types in `src/types/`
- Place content in `src/content/` following the content structure

### Naming Conventions

- **Components**: PascalCase (e.g., `Button.astro`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)
- **Types**: camelCase (e.g., `brand.ts`)
- **Content**: kebab-case (e.g., `our-purpose.mdx`)

## Commit Message Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

### Commit Types

#### Primary Commit Types

1. **`fix:`** - Bug fixes

   ```bash
   git commit -m "fix: resolve bug in search functionality"
   ```

2. **`feat:`** - New features

   ```bash
   git commit -m "feat: add new search feature"
   ```

3. **`feat!:`** or **`BREAKING CHANGE:`** - Breaking changes

   ```bash
   git commit -m "feat!: completely redesign the UI"
   # or
   git commit -m "feat: new API design

   BREAKING CHANGE: This changes the entire API structure"
   ```

#### Other Commit Types

- **`docs:`** - Documentation changes

  ```bash
  git commit -m "docs: update README"
  ```

- **`chore:`** - Maintenance tasks

  ```bash
  git commit -m "chore: update dependencies"
  ```

- **`style:`** - Code style changes (formatting, etc.)

  ```bash
  git commit -m "style: format code"
  ```

- **`refactor:`** - Code refactoring

  ```bash
  git commit -m "refactor: restructure components"
  ```

- **`test:`** - Test additions or changes

  ```bash
  git commit -m "test: add e2e tests for homepage"
  ```

- **`perf:`** - Performance improvements
  ```bash
  git commit -m "perf: optimize image loading"
  ```

### Commit Message Format

```
<type>: <subject>

[optional body]

[optional footer]
```

Examples:

- `fix: resolve navigation menu overflow issue`
- `feat: add dark mode support`
- `docs: update contributing guidelines`

## Code Quality

### Pre-commit Checks

Before committing, ensure all checks pass:

```bash
npm run precommit
```

This runs:

- TypeScript type checking
- ESLint linting
- Markdown linting
- Code formatting checks

### Manual Checks

You can run individual checks:

```bash
npm run typecheck  # TypeScript checking
npm run lint       # Linting
npm run lint:md    # Markdown linting
npm run format:check  # Format checking
```

### Auto-fix

Many issues can be auto-fixed:

```bash
npm run lint:fix      # Fix linting issues
npm run lint:md:fix   # Fix markdown issues
npm run format        # Format code
```

## Testing

### End-to-End Tests

We use Playwright for end-to-end testing:

```bash
# Run all tests
npm run test:e2e

# Run tests with UI (recommended for development)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

### Writing Tests

- Place tests in `tests/e2e/`
- Follow the existing test structure
- Test critical user flows
- Ensure tests are deterministic and reliable

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    await page.goto('/');
    // Test implementation
  });
});
```

## Pull Request Process

1. **Ensure your PR**:
   - Follows the code style guidelines
   - Includes tests if applicable
   - Updates documentation if needed
   - Passes all CI checks

2. **Write a clear PR description**:
   - What changes were made
   - Why the changes were made
   - How to test the changes
   - Any breaking changes

3. **Keep PRs focused**:
   - One feature or fix per PR
   - Keep changes reasonably sized
   - Avoid unrelated changes

4. **Respond to feedback**:
   - Address review comments promptly
   - Be open to suggestions
   - Update the PR as needed

## Questions?

If you have questions about contributing:

- Check existing issues and PRs
- Create a new issue with the `question` label
- Reach out to maintainers

Thank you for contributing! 🎉

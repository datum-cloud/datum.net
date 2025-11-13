# Contributing to Datum Inc. Website

Thank you for your interest in contributing to the Datum Inc. website! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Accept constructive criticism gracefully
- Prioritize the community and project health

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/datum.net.git
cd datum.net
```

2. **Install dependencies**

```bash
bun install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**

```bash
bun run dev
```

The site will be available at `http://localhost:4321`

## Development Workflow

### Creating a Branch

Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### Making Changes

1. Make your changes in your feature branch
2. Test your changes locally
3. Run code quality checks:

```bash
bun run typecheck  # TypeScript checks
bun run lint       # ESLint
bun run format     # Prettier formatting
```

4. Run tests if applicable:

```bash
bun run test:e2e   # End-to-end tests
```

### Pre-commit Checks

The project uses Husky for pre-commit hooks. Before committing, the following will run automatically:

- TypeScript type checking
- ESLint linting
- Prettier formatting
- Markdown linting

If any check fails, fix the issues before committing.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define types/interfaces for props and data structures
- Avoid `any` types - use `unknown` if necessary
- Enable strict mode compliance

### Astro Components

```astro
---
// Props interface at the top
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<div class="component">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</div>
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS class naming convention: `component--modifier` (not `component__element`)
- Keep custom CSS minimal

### File Organization

- One component per file
- Co-locate related files (components, types, utils)
- Use index files for public exports
- Keep files under 300 lines when possible

### Code Quality

- Write self-documenting code
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions small and focused
- Avoid deep nesting (max 3 levels)

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(blog): add social share buttons"

# Bug fix
git commit -m "fix(nav): resolve mobile menu z-index issue"

# Documentation
git commit -m "docs: update installation instructions"

# Breaking change
git commit -m "feat(api)!: change response format

BREAKING CHANGE: API responses now use camelCase"
```

### Version Bumps

Commits trigger automatic version bumps via Release Please:

- `fix:` → Patch version (0.0.x)
- `feat:` → Minor version (0.x.0)
- `feat!:` or `BREAKING CHANGE:` → Major version (x.0.0)

## Pull Request Process

### Before Submitting

1. ✅ All tests pass
2. ✅ Code is linted and formatted
3. ✅ Type checking passes
4. ✅ Documentation updated (if needed)
5. ✅ Commits follow conventional format

### Creating a Pull Request

1. **Push your branch**

```bash
git push origin feature/your-feature-name
```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template**:
   - Clear title describing the change
   - Description of what changed and why
   - Link to related issues
   - Screenshots (for UI changes)
   - Breaking changes (if any)

4. **Request review** from maintainers

### PR Review Process

- Maintainers will review your PR
- Address feedback and update your PR
- Once approved, your PR will be merged
- The branch will be deleted automatically

### After Merge

- Delete your local branch:

```bash
git branch -d feature/your-feature-name
```

- Pull the latest changes:

```bash
git checkout main
git pull origin main
```

## Testing

### Running Tests

```bash
# Run all e2e tests
bun run test:e2e

# Run tests in UI mode
bun run test:e2e:ui

# Run tests in debug mode
bun run test:e2e:debug
```

### Writing Tests

Place tests in `/tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    await page.goto('/');

    // Your test assertions
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Test Guidelines

- Write descriptive test names
- Test user behavior, not implementation
- Keep tests independent and isolated
- Clean up test data after tests
- Use page objects for complex pages

## Documentation

### Updating Documentation

- Update README.md for setup/usage changes
- Update PROJECT_STRUCTURE.md for structural changes
- Update inline code comments for complex logic
- Add JSDoc comments for public APIs

### Documentation Style

- Use clear, concise language
- Include code examples
- Keep documentation up-to-date with code
- Use proper markdown formatting

## Need Help?

- 📖 Check the [README](README.md) for setup instructions
- 🏗️ Review [Project Structure](PROJECT_STRUCTURE.md)
- 💬 Ask questions in GitHub Discussions
- 🐛 Report bugs via GitHub Issues

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Datum Inc. website! 🎉

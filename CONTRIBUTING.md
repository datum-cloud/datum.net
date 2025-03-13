# Contributing to Datum Inc. Website

This document outlines the development setup and coding standards for the Datum Inc. website project.

## Development Setup

### Prerequisites

- Node.js (version specified in package.json)
- npm (comes with Node.js)
- Git

### Initial Setup

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd datum.net-astro
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

   This will automatically:

   - Install all project dependencies
   - Set up Husky git hooks through the `prepare` script
   - Configure lint-staged for pre-commit checks

3. Verify Husky setup:

   ```bash
   # Check if .husky directory exists
   ls -la .husky

   # Check if pre-commit hook is executable
   ls -la .husky/pre-commit

   # Make pre-commit hook executable
   chmod +x .husky/pre-commit
   ```

   You should see:

   - A `.husky` directory
   - An executable `pre-commit` file inside it

4. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Code Quality Tools

The project uses several tools to maintain code quality:

### ESLint

ESLint is used for JavaScript/TypeScript/Astro linting and formatting. Configuration is in `.eslintrc.cjs`.

```bash
# Check for issues
npm run lint

# Fix issues automatically
npm run lint:fix
```

### Markdownlint

Markdownlint ensures consistent markdown formatting. Configuration is in `.markdownlint.json`.

```bash
# Check markdown files
npm run lint:md

# Fix markdown issues
npm run lint:md:fix
```

## Git Hooks

The project uses Husky and lint-staged to enforce code quality before commits:

### Pre-commit Hook

Before each commit, the following checks run automatically:

- ESLint (includes Prettier) on JavaScript/TypeScript/Astro files
- Markdownlint on markdown files

### Configuration

Git hooks are configured in:

- `.husky/pre-commit`: Pre-commit hook script
- `package.json`: lint-staged configuration

### Verifying Husky Setup

To ensure Husky is working correctly:

1. Make a test commit:

   ```bash
   # Create a test file
   echo "console.log('test');" > test.js

   # Stage the file
   git add test.js

   # Try to commit
   git commit -m "test: verify husky setup"
   ```

2. You should see:
   - Husky running the pre-commit hook
   - lint-staged processing your files
   - ESLint/Prettier running on JavaScript files
   - Markdownlint running on markdown files

If you don't see these checks running, see the troubleshooting section below.

## VS Code Setup

For the best development experience, install these VS Code extensions:

1. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. [Markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

### Recommended VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[astro]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Code Style Guide

### JavaScript/TypeScript

- Use TypeScript for new code
- Follow ESLint configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Astro Components

- Use TypeScript for component props
- Follow Astro's best practices
- Keep components modular and reusable
- Use semantic HTML elements

### Markdown/MDX

- Follow markdownlint rules
- Use proper heading hierarchy
- Include alt text for images
- Use fenced code blocks with language specifiers
- Keep lines under 100 characters when possible

### React Components in MDX

- Use TypeScript for component props
- Keep components simple and focused
- Use proper semantic HTML
- Follow accessibility guidelines

## Common Issues and Solutions

### Linting Errors

1. **ESLint Errors**

   - Run `npm run lint:fix` to fix automatically
   - Check `.eslintrc.cjs` for rule configurations

2. **Markdown Issues**
   - Run `npm run lint:md:fix` to fix automatically
   - Check `.markdownlint.json` for markdown rules

### Git Hook Issues

If pre-commit hooks aren't working:

1. First-time setup:

   ```bash
   # Ensure husky is installed
   npm install husky --save-dev

   # Initialize husky
   npx husky install

   # Add pre-commit hook
   npx husky add .husky/pre-commit "npx lint-staged"

   # Make pre-commit hook executable
   chmod +x .husky/pre-commit
   ```

2. If hooks still aren't working:

   - Check if `.husky` directory exists
   - Verify `pre-commit` file is executable
   - Ensure `lint-staged` is in package.json
   - Try removing and reinstalling node_modules:
     ```bash
     rm -rf node_modules
     npm install
     ```
   - If needed, make the hook executable again:
     ```bash
     chmod +x .husky/pre-commit
     ```

3. If you see "command not found" errors:
   - Make sure all dependencies are installed
   - Try using `npx` for commands in lint-staged:
     ```json
     "lint-staged": {
       "*.{js,jsx,ts,tsx,astro}": [
         "npx eslint --fix",
         "npx prettier --write"
       ]
     }
     ```

## Need Help?

- Check the project documentation
- Review existing code for examples
- Ask team members for guidance
- Create an issue for discussion

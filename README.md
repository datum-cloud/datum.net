# Datum Inc. Website

This is the official website for Datum Inc., built with Astro.

## Getting Started

### Prerequisites

- Node.js (version specified in package.json)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Build file to enable pagefind in dev mode

```bash
npm run build
```

4. Start the development server:

```bash
npm run dev
```

## Project Structure

```
.
├── src/                # Source code
│   ├── assets/         # Static assets (images, fonts, etc.)
│   ├── components/     # Reusable UI components
│   ├── content/        # MDX content files
│   ├── data/           # Static data files
│   ├── layouts/        # Page layouts and templates
│   ├── pages/          # Page components and routing
│   ├── styles/         # Global styles and CSS
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions and helpers
├── public/             # Static files served as-is
├── config/             # Configuration files
├── .github/            # GitHub configuration and workflows
├── .vscode/            # VS Code settings
├── astro.config.mjs    # Astro configuration
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Docker build configuration
├── package.json        # Project dependencies and scripts
├── tailwind.config.mjs # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Docker Setup

### Prerequisites

- Docker
- Docker Compose

### Development with Docker

1. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration.

2. Start the development environment:

   ```bash
   docker compose up dev
   ```

   This will:

   - Build the development image using Node.js 22 Alpine
   - Mount your local codebase for hot-reloading
   - Make the app available at http://localhost:4321

3. Development Features:
   - Hot-reloading enabled
   - Source code mounted from host
   - Node modules cached in Docker volume
   - Full access to development tools
   - Network access from other devices via host IP

### Production with Docker

1. Build and run the production environment:

   ```bash
   docker compose up prod
   ```

   This will:

   - Build an optimized production image
   - Run the application in production mode
   - Enable automatic restarts unless stopped
   - Make the app available at http://localhost:4321

2. Manual production deployment:

   ```bash
   # Build the production image
   docker build -t datum-website --target production .

   # Run the production container
   docker run -p 4321:4321 \
     -e NODE_ENV=production \
     -e SITE_URL=your-site-url \
     datum-website
   ```

### Docker Configuration Details

The setup uses a multi-stage Dockerfile:

1. Base stage (`node:22-alpine`)

   - Minimal Alpine Linux with Node.js 22
   - Common workspace setup

2. Development stage

   - Full development dependencies
   - Source code mounting
   - Hot-reload enabled
   - Development-specific configurations

3. Production stage
   - Multi-stage build for optimization
   - Only production dependencies
   - Pre-built assets
   - Minimal final image size

### Network Configuration

- Host: `0.0.0.0` (allows external access)
- Port: 4321 (configurable via environment)
- Docker network: `datum-network` (bridge mode)
- Volume mounts (development):
  - `.:/src`: Source code
  - `/app/node_modules`: Dependencies

### Troubleshooting

1. If the development server isn't accessible:

   ```bash
   # Rebuild the development image
   docker compose up dev --build
   ```

2. To view logs:

   ```bash
   # Development logs
   docker compose logs dev

   # Production logs
   docker compose logs prod
   ```

3. To clean up:

   ```bash
   # Stop and remove containers
   docker compose down

   # Remove volumes too
   docker compose down -v
   ```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                                 |
| :------------------------ | :----------------------------------------------------- |
| `npm install`             | Installs dependencies                                  |
| `npm run dev`             | Starts local dev server at `localhost:4321`            |
| `npm run build`           | Build your production site to `./dist/`                |
| `npm run preview`         | Preview your build locally, before deploying           |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check`       |
| `npm run astro -- --help` | Get help using the Astro CLI                           |
| `npm run lint`            | Check for linting and formatting issues                |
| `npm run lint:fix`        | Automatically fix linting and formatting issues        |
| `npm run lint:md`         | Check for markdown linting issues                      |
| `npm run lint:md:fix`     | Automatically fix markdown linting issues              |
| `npm run format`          | Format all files using Prettier                        |
| `npm run format:check`    | Check if files are formatted correctly                 |
| `npm run typecheck`       | Astro typescript check                                 |
| `npm run precommit`       | Run all checks (typecheck, lint, format) before commit |

## Code Quality

This project uses ESLint with Prettier integration for code quality and formatting:

- **ESLint**: For code linting and enforcing code style rules
- **Prettier**: Integrated with ESLint for code formatting
- **TypeScript**: For type checking and enhanced IDE support
- **Markdownlint**: For markdown and MDX file linting

The configuration supports:

- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- Astro (`.astro`)
- Markdown (`.md`)
- MDX (`.mdx`)
- JSON (`.json`)

### Markdown Linting

The project uses `markdownlint-cli` to ensure consistent markdown formatting across all content files. The linting is specifically configured for MDX files with React components in the `/src/content/` directory.

#### Configuration

The markdownlint configuration (`.markdownlint.json`) is optimized for MDX and React components:

- Disables line length limits (MD013)
- Allows inline HTML/JSX (MD033)
- Flexible heading structure (MD024, MD025, MD026)
- Supports component-based content (MD036, MD040)
- Allows dynamic content (MD042, MD047)
- Flexible list formatting (MD029, MD031, MD032)

#### Usage

To check markdown files:

```bash
npm run lint:md
```

To automatically fix markdown issues:

```bash
npm run lint:md:fix
```

The linter will only check files in the `/src/content/` directory, including:

- Blog posts
- Documentation
- Guides
- Changelog entries
- Static pages

### VS Code Setup

For the best development experience, install the following VS Code extensions:

1. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
3. [Markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

The project includes VS Code settings (`.vscode/settings.json`) that enable:

- Live linting and error detection
- Format on save
- Automatic ESLint fixes on save
- Proper formatting for Astro, TypeScript, JavaScript, and Markdown files
- TypeScript SDK integration

### Ignore Files

The project includes configuration files to ignore certain files and directories:

- `.prettierignore`: Specifies files and directories to be ignored by Prettier
- `.eslintignore`: Specifies files and directories to be ignored by ESLint

These files ignore:

- Build output (`dist/`, `.astro/`)
- Dependencies (`node_modules/`)
- Generated files (`*.generated.*`, `*.min.*`)
- Log files
- Environment files (except `.env.example`)
- Editor directories and files
- Package manager files
- Public assets

## End-to-End Testing

This project uses Playwright for end-to-end testing, providing reliable testing across multiple browsers.

### Setup

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install
```

### Running Tests

| Command                   | Action                                       |
| :------------------------ | :------------------------------------------- |
| `npm run test:e2e`        | Run all tests in headless mode               |
| `npm run test:e2e:ui`     | Run tests with UI mode (recommended for dev) |
| `npm run test:e2e:debug`  | Run tests in debug mode                      |
| `npm run test:e2e:report` | Show the last test report                    |

### Test Structure

Tests are located in the `tests/e2e` directory:

```
tests/
└── e2e/
    ├── home.spec.ts    # Homepage tests
    └── ...            # Other test files
```

### Test Reports

- Test reports are generated in the `playwright-report` directory
- Screenshots and videos of failures are saved in `test-results`
- Reports are not committed to the repository (see `.gitignore`)

### Writing Tests

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

### CI/CD Integration

The tests are configured to run in CI environments:

- Retries failed tests in CI
- Generates HTML reports
- Takes screenshots on failures
- Supports parallel test execution

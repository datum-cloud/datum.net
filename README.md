# Datum Inc. Website

This is the official website for Datum Inc., built with Astro.

## Getting Started

### Prerequisites

- Bun (latest version recommended) - [Install Bun](https://bun.sh)

### Installation

1. Install dependencies:

```bash
bun install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Build file to enable pagefind in dev mode

```bash
bun run build
```

4. Start the development server:

```bash
bun run dev
```

## Project Structure

For a detailed overview of the project structure and organization, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

For content organization and content collections, see [CONTENT_STRUCTURE.md](CONTENT_STRUCTURE.md).

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
   - Build the development image using Bun Alpine
   - Mount your local codebase for hot-reloading
   - Make the app available at http://localhost:4321

3. Development Features:
   - Hot-reloading enabled
   - Source code mounted from host
   - Dependencies cached in Docker volume
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

The setup uses multi-stage Dockerfile for faster builds:

1. **Base stage** (`oven/bun:1.2.3-alpine`)
   - Minimal Alpine Linux with Bun runtime
   - Common workspace setup

2. **Dependencies stage** (shared cache)
   - Installs all dependencies once
   - Shared between development and build stages
   - Uses BuildKit cache mounts for faster rebuilds

3. **Development stage**
   - Copies pre-built dependencies from cache
   - Source code mounting for hot-reload
   - Full development environment

4. **Build stage**
   - Extends dependencies stage (reuses node_modules)
   - Compiles production assets
   - Optimized for build performance

5. **Production-deps stage**
   - Installs production dependencies only
   - Runs in parallel with build stage
   - Smaller dependency footprint

6. **Production stage**
   - Copies only production dependencies
   - Pre-built assets from build stage
   - Minimal final image size (~200MB)

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

4. If builds are slow or dependency issues occur:

   ```bash
   # Clear Docker build cache
   docker builder prune -af
   
   # Rebuild from scratch
   docker compose build --no-cache dev
   ```

5. To optimize build performance:

   ```bash
   # Enable BuildKit (if not default)
   export DOCKER_BUILDKIT=1
   
   # Build with inline cache
   docker compose build --pull
   ```

### Development with local kubernetes

1. Install [Minikube](https://minikube.sigs.k8s.io/docs/).

2. Create secret.yaml file separated with this source. Value:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: datum-net
  namespace: datum-net
type: Opaque
data:
  POSTGRES_USER:
  POSTGRES_PASSWORD:
  APP_ID:
  APP_INSTALLATION_ID:
  APP_PRIVATE_KEY:
```

Then apply with command:

```bash
kubectl apply -f <this_secret_file_path>
```

3. Apply the kustomize config file

```bash
kubectl apply -k config/base
```

4. Apply the kustomize postgres config file

```bash
kubectl apply -k config/dev/postgres-config.yaml
```

5. Install postgresql helm. example from bitnami source

```bash
helm install postgresql -f config/dev/postgres-values.yaml -n datum-net oci://registry-1.docker.io/bitnamicharts/postgresql
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Version Management

This project uses [Release Please](https://github.com/googleapis/release-please) for automated version management. To bump the version, follow these commit message conventions:

### Version Bump Types

1. **Patch Version (0.0.x)** - For bug fixes:

   ```bash
   git commit -m "fix: resolve bug in search functionality"
   ```

2. **Minor Version (0.x.0)** - For new features:

   ```bash
   git commit -m "feat: add new search feature"
   ```

3. **Major Version (x.0.0)** - For breaking changes:

   ```bash
   git commit -m "feat!: completely redesign the UI"
   # or
   git commit -m "feat: new API design

   BREAKING CHANGE: This changes the entire API structure"
   ```

### Other Commit Types

These types don't trigger version bumps but are included in the changelog:

```bash
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
git commit -m "style: format code"
git commit -m "refactor: restructure components"
```

After pushing commits to the main branch:

1. Release Please will create a PR with the version bump
2. The PR will include updated:
   - `package.json` version
   - `CHANGELOG.md`
3. When the PR is merged, it will create a new release

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                                 |
| :------------------------ | :----------------------------------------------------- |
| `bun install`             | Installs dependencies                                  |
| `bun run dev`             | Starts local dev server at `localhost:4321`            |
| `bun run build`           | Build your production site to `./dist/`                |
| `bun run preview`         | Preview your build locally, before deploying           |
| `bun run astro ...`       | Run CLI commands like `astro add`, `astro check`       |
| `bun run astro -- --help` | Get help using the Astro CLI                           |
| `bun run lint`            | Check for linting and formatting issues                |
| `bun run lint:fix`        | Automatically fix linting and formatting issues        |
| `bun run lint:md`         | Check for markdown linting issues                      |
| `bun run lint:md:fix`     | Automatically fix markdown linting issues              |
| `bun run format`          | Format all files using Prettier                        |
| `bun run format:check`    | Check if files are formatted correctly                 |
| `bun run typecheck`       | Astro typescript check                                 |
| `bun run precommit`       | Run all checks (typecheck, lint, format) before commit |

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
bun run lint:md
```

To automatically fix markdown issues:

```bash
bun run lint:md:fix
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
bun install
```

2. Install Playwright browsers:

```bash
bunx playwright install
```

### Running Tests

| Command                   | Action                                       |
| :------------------------ | :------------------------------------------- |
| `bun run test:e2e`        | Run all tests in headless mode               |
| `bun run test:e2e:ui`     | Run tests with UI mode (recommended for dev) |
| `bun run test:e2e:debug`  | Run tests in debug mode                      |
| `bun run test:e2e:report` | Show the last test report                    |

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

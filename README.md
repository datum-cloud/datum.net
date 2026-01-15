# Datum Inc. Website

This is the official website for Datum Inc., built with Astro.

## Getting Started

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

For detailed information about the project structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

### Image

Import component

```
import Figure from '@components/Figure.astro';
```

Example in real use:

```
src/content/blog/from-cage-nuts-to-kubernetes.mdx
```

#### Caption + Alignment

```
<Figure title="Caption text" align="left/center/right">
 ![Alt text](./path/to/image.jpg)
</Figure>
```

#### Alignment

##### Align left

```
![Routing security dashboard UI](/src/content/blog/assets/images/from-cage-3.png#left)
```

##### Align center

```
![Routing security dashboard UI](/src/content/blog/assets/images/from-cage-3.png#center)
```

##### Align right

```
![Routing security dashboard UI](/src/content/blog/assets/images/from-cage-3.png#right)
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
   - Minimum requirement Alpine Linux with Node.js 22
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

## Development with local kubernetes

1. Install [Minikube](https://minikube.sigs.k8s.io/docs/) and start minikube

```
minikube start
```

2. Install postgresql helm. example from bitnami source

```bash
helm install postgresql -f config/dev/postgres-values.yaml -n datum-net oci://registry-1.docker.io/bitnamicharts/postgresql
```

3. Create namespace

```
kubectl create namespace datum-net
```

4. Create secret.yaml file separated with this source. Value:

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
kubectl apply -f ../secret.yaml
```

5. Apply the kustomize config file

```bash
kubectl apply -k config/base -n datum-net
```

Postgres config file

```bash
kubectl apply -k config/dev/postgres-config.yaml
```

### Create port forwarder

```bash
kubectl port-forward pod_name -n datum-net 4321:4321
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct, development setup, and the process for submitting pull requests.

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

## Content Management with Front Matter CMS

This project uses [Front Matter CMS](https://frontmatter.codes/) - a powerful headless CMS that runs directly in VS Code, providing a GUI for managing your Astro content collections.

### Installation & Setup

1. Open VS Code
2. Go to Extensions (⌘+Shift+X on Mac, Ctrl+Shift+X on Windows/Linux)
3. Search for "Front Matter CMS"
4. Click "Install" on the extension by Elio Struyf

**Note**: This project already has Front Matter configuration in `.frontmatter/starlight/contenttypes.json`, so you can skip manual initialization.

### Content Collections Configuration

The project has pre-configured content types for all Astro collections:

#### Available Content Types

| Content Type | Description                     | Location                  |
| ------------ | ------------------------------- | ------------------------- |
| `docs`       | Documentation pages (Starlight) | `src/content/docs/`       |
| `blog`       | Blog posts                      | `src/content/blog/`       |
| `authors`    | Author profiles                 | `src/content/authors/`    |
| `handbook`   | Company handbook                | `src/content/handbook/`   |
| `changelog`  | Version changelogs              | `src/content/changelog/`  |
| `features`   | Product features                | `src/content/features/`   |
| `huddles`    | Community events                | `src/content/huddles/`    |
| `faq`        | FAQ entries                     | `src/content/faq/`        |
| `categories` | Blog categories                 | `src/content/categories/` |
| `pages`      | Marketing pages                 | `src/content/pages/`      |
| `about`      | About pages                     | `src/content/about/`      |
| `legal`      | Legal documents                 | `src/content/legal/`      |

### Field Groups

The project uses reusable field groups for complex structures:

| Field Group     | Used In        | Purpose                                        |
| --------------- | -------------- | ---------------------------------------------- |
| `og`            | Meta fields    | Open Graph social sharing data                 |
| `hero`          | Docs, handbook | Hero section with tagline and image            |
| `social`        | Authors        | Social media links (Twitter, GitHub, LinkedIn) |
| `price`         | Pricing        | Price structure (badge, amount, note)          |
| `cta`           | Pricing, pages | Call-to-action buttons                         |
| `images`        | Pages, about   | Image galleries with alt text                  |
| `readTheDocs`   | Features       | Documentation links                            |
| `changelogTags` | Changelog      | Tag entries (fixed/new/changed)                |

### Troubleshooting

#### Front Matter Panel Not Showing

1. Ensure you have a content file open
2. Check the file is in `src/content/` directory
3. Try reloading VS Code: `Developer: Reload Window`

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

### VS Code Setup

For the best development experience, install the following VS Code extensions:

1. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
3. [Markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)
4. [Front Matter CMS](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter) - For content management

The project includes VS Code settings (`.vscode/settings.json`) that enable:

- Live linting and error detection
- Format on save
- Automatic ESLint fixes on save
- Proper formatting for Astro, TypeScript, JavaScript, and Markdown files
- TypeScript SDK integration

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

Error: Failed to pull image "ghcr.io/datum-cloud/datum-net:latest": no matching manifest for linux/arm64/v8 in the manifest list entries

Build Local ARM64 Image (For Local Development)
If you're running Kubernetes locally (Docker Desktop, Minikube, etc.), build the image locally:

```
# Build for ARM64
docker build -t ghcr.io/datum-cloud/datum-net:latest .

# If using Docker Desktop with Kubernetes, the image is already available
# If using Minikube, load the image:
minikube image load ghcr.io/datum-cloud/datum-net:latest
```

### Resources

- [Front Matter CMS Documentation](https://frontmatter.codes/docs)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Zod Schema Validation](https://zod.dev/)
- [Project Content Structure](./CONTENT_STRUCTURE.md)

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

For detailed information about preview and production environments with Server-Side Rendering (SSR), please refer to [SSR Production Guide](DOCKER_USAGE.md).

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

# Deploying Datum.net with Server-Side Rendering (SSR)

This guide provides step-by-step instructions for deploying the Datum.net website using Astro's Server-Side Rendering capabilities with the Node.js adapter for high-traffic production environments.

## Why Server-Side Rendering?

Server-Side Rendering (SSR) offers several advantages over static site generation:

- **Dynamic Content**: Generate HTML on-demand with the latest data
- **Private/User-specific Content**: Render different content based on the user
- **API Routes**: Create server endpoints within your Astro project
- **Better Performance for Large Sites**: Avoid long build times for sites with thousands of pages
- **Incremental Adoption**: Mix static and server-rendered pages

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose for containerization
- Git repository cloned to your local machine

## Detailed Step-by-Step Implementation

### Step 1: Install the Node.js Adapter

First, add the Astro Node.js adapter to your project:

```bash
# Using npm
npm install @astrojs/node

# Using yarn
yarn add @astrojs/node

# Using pnpm
pnpm add @astrojs/node
```

### Step 2: Back Up Your Current Configuration

Before making changes, create a backup of your current Astro configuration:

```bash
# Create a backup of your current configuration
cp astro.config.mjs astro.config.mjs.bak
```

### Step 3: Manually Update Astro Configuration

Open your `astro.config.mjs` file in a text editor and make the following changes:

1. Import the Node.js adapter at the top of the file:

   ```javascript
   import node from '@astrojs/node';
   ```

2. Add the SSR configuration to your `defineConfig` object:

   ```javascript
   export default defineConfig({
     // Existing configuration...

     // Add these lines for SSR:
     output: 'server',
     adapter: node({
       mode: 'standalone',
     }),

     // Rest of your configuration...
   });
   ```

Your complete configuration should look similar to this:

```javascript
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';

import { loadEnv } from 'vite';
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

const port = parseInt(env.PORT || '4321');

export default defineConfig({
  site: env.SITE_URL || `http://localhost:${port}`,
  output: 'server', // Change output to 'server' for SSR
  adapter: node({
    mode: 'standalone', // Use 'standalone' for production
  }),
  integrations: [
    mdx(),
    sitemap(),
    robotsTxt({
      sitemap: true,
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/api'],
          crawlDelay: 10,
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    preview: {
      allowedHosts: ['website.staging.env.datum.net', 'datum.test'],
    },
    server: {
      allowedHosts: ['website.staging.env.datum.net', 'datum.test'],
      host: true, // Allow external connections
    },
  },
});
```

### Step 4: Update Your package.json Scripts

Make sure your package.json has the correct scripts for SSR. Update or add the following:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "start": "node ./dist/server/entry.mjs"
}
```

The `start` script is important for running the Node.js server.

### Step 5: Create or Update Your Dockerfile for SSR

Modify your Dockerfile to handle SSR properly. You can use the multi-stage approach to keep both static and SSR capabilities:

```dockerfile
# Base stage for both development and production
FROM node:22-alpine AS base
WORKDIR /app

# Development stage
FROM base AS development
ENV NODE_ENV=development
# Install dependencies
COPY package*.json ./
RUN npm install
# Copy source code
COPY . .
# Expose development port
EXPOSE 4321
# Start development server
CMD ["npm", "run", "dev", "--", "--host"]

# Production build stage for static site (original)
FROM base AS build-static
ENV NODE_ENV=production
# Install dependencies
COPY package*.json ./
# Skip all lifecycle scripts including husky
RUN npm install --ignore-scripts
# Copy source code
COPY . .
# Build the application
RUN npm run build

# Production build stage for SSR
FROM base AS build
ENV NODE_ENV=production
# Install dependencies including Node.js adapter
COPY package*.json ./
# Skip all lifecycle scripts including husky
RUN npm install --ignore-scripts @astrojs/node
# Copy source code
COPY . .
# Build the application with SSR
RUN npm run build

# Preview stage for static site (using preview server)
FROM node:22-alpine AS preview
ENV NODE_ENV=production
WORKDIR /app
# Copy built assets and package files from build stage
COPY --from=build-static /app/dist ./dist
COPY --from=build-static /app/package.json ./package.json
COPY --from=build-static /app/package-lock.json ./package-lock.json
# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts
# Expose production port
EXPOSE 4321
# Start production server using Astro preview with allowed hosts parameter
CMD ["npm", "run", "preview", "--", "--host", "--allowed-hosts=datum.test"]

# Production stage for SSR
FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
# Copy built assets and package files from SSR build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
# Install only production dependencies including Node.js adapter
RUN npm install --omit=dev --ignore-scripts @astrojs/node
# Set environment variables for the Node.js server
ENV HOST=0.0.0.0
ENV PORT=80
# Expose production port
EXPOSE 80
# Start Node.js server
CMD ["node", "./dist/server/entry.mjs"]
```

### Step 6: Update docker-compose.yml for SSR

Create a separate service for SSR in your docker-compose.yml file:

```yaml
services:
  dev:
    build:
      context: .
      target: development
    ports:
      - '4321:4321'
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - SITE_URL=${SITE_URL}
    networks:
      - datum-network
    command: npm run dev -- --host 0.0.0.0 --port 4321

  # Preview service for static site
  preview:
    build:
      context: .
      target: preview
    ports:
      - '80:4321'
    environment:
      - NODE_ENV=production
      - SITE_URL=${SITE_URL}
    restart: unless-stopped
    networks:
      - datum-network

  # Production service using SSR
  prod:
    build:
      context: .
      target: production
    ports:
      - '80:80'
    environment:
      - NODE_ENV=production
      - SITE_URL=${SITE_URL}
      - HOST=0.0.0.0
      - PORT=80
    restart: unless-stopped
    networks:
      - datum-network

networks:
  datum-network:
    driver: bridge
```

### Step 7: Create or Update .env File

Ensure your .env file has the correct settings for your SSR environment:

```env
# Base site URL
SITE_URL=http://localhost

# Node.js server settings (for SSR)
HOST=0.0.0.0
PORT=80
```

### Step 8: Create API Routes (Optional)

One of the benefits of SSR is the ability to create API endpoints. Here's an example of a simple API route:

1. Create a directory for API routes:

   ```bash
   mkdir -p src/pages/api
   ```

2. Create a simple health check endpoint:

   ```bash
   # Create the health check API file
   touch src/pages/api/health.js
   ```

3. Add the following code to the health.js file:
   ```javascript
   export function get() {
     return new Response(
       JSON.stringify({
         status: 'ok',
         timestamp: new Date().toISOString(),
       }),
       {
         status: 200,
         headers: {
           'Content-Type': 'application/json',
         },
       }
     );
   }
   ```

### Step 9: Build and Run the SSR Container

Finally, build and run your SSR container:

```bash
# Stop any running containers
docker compose down

# Build the SSR container
docker compose build prod

# Run the SSR container
docker compose up prod
```

### Step 10: Test Your SSR Setup

To verify your SSR setup is working correctly:

1. Open your browser and navigate to `http://localhost`
2. Inspect the page source to confirm it's server-rendered (look for dynamic content)
3. Test any API endpoints you created (e.g., http://localhost/api/health)
4. Verify that environment variables are properly injected

### Switching Between Static and SSR Modes

To switch between modes:

**For static site preview:**

```bash
docker compose down
docker compose up preview
```

**For SSR production mode:**

```bash
docker compose down
docker compose up prod
```

## Advanced Configuration

### Caching Strategies

For high-traffic sites, implement caching to reduce server load:

```javascript
// Add to your API routes or dynamic pages
export const config = {
  // Set cache control headers (example: cache for 5 minutes)
  headers: {
    'Cache-Control': 'public, max-age=300',
  },
};
```

### Health Checks

Add a health check endpoint for container orchestration:

```javascript
// src/pages/api/health.js
export function get() {
  return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
```

### Environment Variables for Production

For sensitive information, use environment variables:

```yaml
# In docker-compose.yml
prod:
  environment:
    - NODE_ENV=production
    - SITE_URL=${SITE_URL}
    - DATABASE_URL=${DATABASE_URL}
    - API_KEY=${API_KEY}
```

### Performance Monitoring

Add performance monitoring in your production environment:

```bash
# Install a monitoring tool like New Relic
npm install newrelic
```

Then add it to your server entry point by modifying your build configuration.

## Scaling for High Traffic

### Horizontal Scaling

Use a container orchestration platform like Kubernetes or Docker Swarm to run multiple instances of your application.

### Load Balancing

Place a load balancer like Nginx or a cloud provider's load balancer in front of your SSR instances.

### Database Connection Pooling

If connecting to a database, implement connection pooling to efficiently handle multiple simultaneous requests.

## Troubleshooting

### Server Not Starting

If the server doesn't start, check:

- Logs with `docker compose logs prod`
- Ensure the correct port is exposed
- Verify environment variables are properly set

### Slow Response Times

If the server is slow to respond:

- Implement caching strategies
- Check for memory leaks
- Consider adding more server instances

### Memory Issues

For memory-intensive applications:

- Adjust Node.js memory allocation: `NODE_OPTIONS="--max-old-space-size=4096"`
- Monitor memory usage with tools like PM2

## Production Deployment Checklist

Before going live with your SSR-enabled site, ensure:

- [x] Security headers are properly configured
- [x] Error handling is in place for all routes
- [x] Logging is configured for production
- [x] Database connections are properly managed
- [x] Caching strategies are implemented
- [x] Static assets are served with proper cache headers
- [x] The application scales based on demand

## Resources

- [Astro SSR Documentation](https://docs.astro.build/en/guides/server-side-rendering/)
- [Node.js Adapter Documentation](https://docs.astro.build/en/guides/integrations-guide/node/)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

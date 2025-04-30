# Base stage for both development and production
FROM node:22-slim AS base
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

# build stage for static site (original)
FROM base AS build-static
ENV NODE_ENV=production
# Install dependencies
COPY package*.json ./
# Skip all lifecycle scripts including husky
RUN npm install --ignore-scripts && npm install sharp
# Copy source code
COPY . .
# Build the application
RUN npm run build

# build stage for SSR
FROM base AS build
ENV NODE_ENV=production
# Install dependencies including Node.js adapter
COPY package*.json ./
# Install dependencies with Sharp support
RUN npm install --ignore-scripts @astrojs/node && npm install sharp
# Copy source code
COPY . .
# Build the application with SSR
RUN npm run build

# Preview stage for static site (using preview server)
FROM base AS preview
ENV NODE_ENV=production
WORKDIR /app
# Copy source code and built assets
COPY . .
COPY --from=build-static /app/dist ./dist
# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts && npm install sharp
# Expose port
EXPOSE 4321
# Start server using Astro preview with allowed hosts parameter
CMD ["npm", "run", "preview", "--", "--host"]

# Production stage for SSR
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
# Copy built assets and package files from SSR build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
# Install only production dependencies including Node.js adapter
RUN npm install --omit=dev --ignore-scripts @astrojs/node && npm install sharp
# Set environment variables for the Node.js server
ENV HOST=0.0.0.0
ENV PORT=4321
# Expose production port
EXPOSE 4321
# Start Node.js server
CMD ["node", "./dist/server/entry.mjs"]

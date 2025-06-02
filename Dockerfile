# Base stage for both development and production
FROM node:22-alpine AS base
WORKDIR /app

# Development stage
FROM base AS development
ENV NODE_ENV=development
ENV ASTRO_DB_REMOTE_URL="libsql://roadmap-ariaedo.aws-ap-northeast-1.turso.io"

# Install dependencies
COPY package*.json ./
RUN npm install
# Copy source code
COPY . .
# Expose development port
EXPOSE 4321
# Start development server
CMD ["npm", "run", "dev", "--", "--host", "--allowed-hosts=website.staging.env.datum.net"]

# Production build stage
FROM base AS build
ENV NODE_ENV=production
ENV ASTRO_DB_REMOTE_URL="libsql://roadmap-ariaedo.aws-ap-northeast-1.turso.io"

# Add empty .env file
RUN touch .env
# Install dependencies
COPY package*.json ./
# Skip all lifecycle scripts including husky
RUN npm install --ignore-scripts
# Copy source code
COPY . .
# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
# Copy built assets and package files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts
# Expose production port
EXPOSE 4321

# Start production server using Astro preview
CMD ["npm", "run", "preview", "--", "--host", "--allowed-hosts=website.staging.env.datum.net"]

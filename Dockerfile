# Base stage for both development and production
FROM node:22.16.0-alpine3.22 AS base
WORKDIR /app

# Define build arguments
ARG SITE_URL
ARG API_URL
ARG SITE_GITHUB
ARG APP_PRIVATE_KEY
ARG APP_INSTALLATION_ID
ARG APP_ID
ARG ASTRO_DB_APP_TOKEN
ARG ASTRO_STUDIO_APP_TOKEN
ARG ASTRO_DB_REMOTE_URL="libsql://roadmap-ariaedo.aws-ap-northeast-1.turso.io"
ARG ASTRO_TELEMETRY_DISABLED

# Set common environment variables
ENV SITE_URL=${SITE_URL}
ENV API_URL=${API_URL}
ENV SITE_GITHUB=${SITE_GITHUB}
ENV APP_PRIVATE_KEY=${APP_PRIVATE_KEY}
ENV APP_INSTALLATION_ID=${APP_INSTALLATION_ID}
ENV APP_ID=${APP_ID}
ENV ASTRO_DB_APP_TOKEN=${ASTRO_DB_APP_TOKEN}
ENV ASTRO_STUDIO_APP_TOKEN=${ASTRO_STUDIO_APP_TOKEN}
ENV ASTRO_DB_REMOTE_URL=${ASTRO_DB_REMOTE_URL}
ENV ASTRO_TELEMETRY_DISABLED=${ASTRO_TELEMETRY_DISABLED}
ENV HOST=0.0.0.0
ENV PORT=4321

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Install dependencies
COPY package*.json ./
RUN npm install
# Copy source code and ensure proper permissions
COPY . .
RUN chmod -R 755 src/pages
# Expose development port
EXPOSE 4321
# Start development server
CMD ["npm", "run", "dev", "--", "--host", "--allowed-hosts=website.staging.env.datum.net"]

# Production build stage
FROM base AS build
ENV NODE_ENV=production

# Add empty .env file
RUN touch .env
# Install dependencies
COPY package*.json ./
# Skip all lifecycle scripts including husky
RUN npm install --ignore-scripts
# Copy source code and ensure proper permissions
COPY . .
RUN chmod -R 755 src/pages
# Build the application
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

# Copy built assets and package files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts
# Copy source pages directory for Astro
COPY --from=build /app/src/pages ./src/pages
RUN chmod -R 755 src/pages
# Expose production port
EXPOSE 4321

# Start production server using Node adapter
CMD ["npm", "start"]

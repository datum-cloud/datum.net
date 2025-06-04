# Base stage for both development and production
FROM node:22.16.0-alpine3.22 AS base
WORKDIR /app

# Development stage
FROM base AS development
ENV NODE_ENV=development
ENV ASTRO_DB_REMOTE_URL="libsql://roadmap-ariaedo.aws-ap-northeast-1.turso.io"
ENV HOST=0.0.0.0
ENV PORT=4321

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
ENV ASTRO_DB_REMOTE_URL="libsql://roadmap-ariaedo.aws-ap-northeast-1.turso.io"
ENV HOST=0.0.0.0
ENV PORT=4321

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
ENV HOST=0.0.0.0
ENV PORT=4321
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

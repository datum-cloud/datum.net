FROM oven/bun:1.2.3-alpine AS base
WORKDIR /app

ENV ASTRO_TELEMETRY_DISABLED=true

# Dependencies stage - shared between dev and build
FROM base AS dependencies
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Development stage
FROM base AS development
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=4321
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json bun.lock* ./
COPY ./.kube/config.yaml ./.kube/config.yaml
COPY . .
RUN chmod -R 755 src/pages
EXPOSE 4321
CMD ["bun", "run", "dev", "--", "--host", "--allowed-hosts=website.staging.env.datum.net"]

# Build stage
FROM dependencies AS build
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
COPY ./.kube/config.yaml ./.kube/config.yaml
COPY . .
RUN chmod -R 755 src/pages
RUN bun run build

# Production dependencies only
FROM base AS production-deps
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production

# Production stage
FROM oven/bun:1.2.3-alpine AS production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
WORKDIR /app
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/bun.lock* ./
COPY --from=build /app/.kube/config.yaml ./.kube/config.yaml
COPY --from=build /app/src/pages ./src/pages
RUN chmod -R 755 src/pages
EXPOSE 4321
CMD ["bun", "./dist/server/entry.mjs"]

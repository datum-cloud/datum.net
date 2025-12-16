FROM node:24.11.1-alpine3.22 AS base
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=true
RUN apk update && \
    apk add --no-cache git
COPY package*.json ./

FROM base AS build
ENV NODE_ENV=production
COPY ./.kube/config.yaml ./.kube/config.yaml
RUN --mount=type=cache,target=/root/.npm npm install --ignore-scripts
COPY . .
RUN chmod -R 755 src/pages
RUN npm run build

FROM base AS development
ENV NODE_ENV=development
COPY ./.kube/config.yaml ./.kube/config.yaml
RUN --mount=type=cache,target=/root/.npm npm install
COPY . .
RUN chmod -R 755 src/pages
CMD ["npm", "run", "dev", "--", "--host", "--allowed-hosts=website.staging.env.datum.net"]

FROM node:24.11.1-alpine3.22 AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

ENV NODE_ENV=production

# Copy files and set ownership to non-root user
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

RUN --mount=type=cache,target=/root/.npm npm install --omit=dev --ignore-scripts

COPY --from=build --chown=nodejs:nodejs /app/src/pages ./src/pages
RUN chmod -R 755 src/pages && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]


FROM node:26.13.1-alpine3.24 AS base
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=true
RUN apk update && \
    apk add --no-cache git
# Node 26 ships no corepack, so install the pnpm that package.json's
# packageManager pins. It stays in the build and development stages only.
# vendor/ holds a file: dependency the lockfile points at.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY vendor ./vendor
RUN npm install -g "$(node -p 'require("./package.json").packageManager.split("+")[0]')" --no-audit --no-fund

FROM base AS build
ENV NODE_ENV=production
ENV STRAPI_CACHE_ENABLED=true
COPY ./.kube/config.yaml ./.kube/config.yaml
RUN pnpm install --frozen-lockfile --prod=false --ignore-scripts
COPY . .
RUN chmod -R 755 src/pages
# Warmup: .cache in layer, so production gets it at runtime
RUN pnpm run build:cache
# Build: cache mount speeds up rebuilds; .cache from layer above persists after unmount
RUN --mount=type=cache,target=/app/.cache pnpm run build
RUN pnpm prune --prod --ignore-scripts

FROM base AS development
ENV NODE_ENV=development
COPY ./.kube/config.yaml ./.kube/config.yaml
RUN pnpm install --frozen-lockfile --prod=false
COPY . .
RUN chmod -R 755 src/pages
CMD ["pnpm", "run", "dev", "--host", "--allowed-hosts=website.staging.env.datum.net"]

FROM node:26.13.1-alpine3.24 AS production
WORKDIR /app
RUN apk add --no-cache --upgrade 'ca-certificates>=20261020-r0'
RUN ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBrMQswCQYDVQQG /etc/ssl/certs/ca-certificates.crt
ENV NODE_OPTIONS=--use-openssl-ca
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.mjs ./server.mjs
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/vendor ./vendor
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src/pages ./src/pages
COPY --from=build /app/.cache ./.cache
RUN chmod -R 755 src/pages

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "./server.mjs"]

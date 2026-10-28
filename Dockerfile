FROM node:26.12.1-alpine3.24 AS base
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=true
RUN apk update && \
    apk add --no-cache git
COPY package*.json ./

FROM base AS build
ENV NODE_ENV=production
ENV STRAPI_CACHE_ENABLED=true
COPY ./.kube/config.yaml ./.kube/config.yaml
RUN --mount=type=cache,target=/root/.npm npm install --ignore-scripts
COPY . .
RUN chmod -R 755 src/pages
# Warmup: .cache in layer, so production gets it at runtime
RUN npm run build:cache
# Build: cache mount speeds up rebuilds; .cache from layer above persists after unmount
RUN --mount=type=cache,target=/app/.cache npm run build

FROM base AS development
ENV NODE_ENV=development
COPY ./.kube/config.yaml ./.kube/config.yaml
RUN --mount=type=cache,target=/root/.npm npm install
COPY . .
RUN chmod -R 755 src/pages
CMD ["npm", "run", "dev", "--", "--host", "--allowed-hosts=website.staging.env.datum.net"]

FROM node:26.12.1-alpine3.24 AS production
WORKDIR /app
RUN apk add --no-cache --upgrade 'ca-certificates>=20261020-r0'
RUN ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBrMQswCQYDVQQG /etc/ssl/certs/ca-certificates.crt
ENV NODE_OPTIONS=--use-openssl-ca
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.mjs ./server.mjs
COPY --from=build /app/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install --omit=dev --ignore-scripts
COPY --from=build /app/src/pages ./src/pages
COPY --from=build /app/.cache ./.cache
RUN chmod -R 755 src/pages

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "./server.mjs"]

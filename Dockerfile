FROM node:22.16.0-alpine3.22 AS base
WORKDIR /app

FROM base AS development

ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=4321

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install
COPY . .
RUN chmod -R 755 src/pages
EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host", "--allowed-hosts=website.staging.env.datum.net"]

FROM base AS build

ARG ASTRO_DB_REMOTE_URL
ENV ASTRO_DB_REMOTE_URL=${ASTRO_DB_REMOTE_URL}

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN touch .env
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install --ignore-scripts
COPY . .
RUN chmod -R 755 src/pages
RUN --mount=type=secret,id=astro_studio_app_token \
    ASTRO_STUDIO_APP_TOKEN=$(cat /run/secrets/astro_studio_app_token) \
    npm run build

FROM node:22.16.0-alpine3.22 AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install --omit=dev --ignore-scripts
COPY --from=build /app/src/pages ./src/pages
RUN chmod -R 755 src/pages
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]

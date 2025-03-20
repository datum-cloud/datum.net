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

# Production build stage
FROM base AS build
ENV NODE_ENV=production
# Install dependencies
COPY package*.json ./
RUN npm ci
# Copy source code
COPY . .

# Production stage
FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
# Install only production dependencies
RUN npm ci --omit=dev
# Expose production port
EXPOSE 4321
# Start production server
CMD ["node", "./dist/server/entry.mjs"]
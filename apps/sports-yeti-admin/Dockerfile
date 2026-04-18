# =============================================================================
# Stage 1: Dev server (hot reload via Expo + Metro)
# =============================================================================
# Used by docker-compose service `admin` for local development.
# Source is bind-mounted at runtime; node_modules live inside the image / a
# named volume so the hoisted workspace install isn't shadowed by the host.
FROM node:20-alpine AS dev

# bash + git are commonly needed by Expo/Metro plugins
RUN apk add --no-cache bash git

WORKDIR /workspace

COPY package.json package-lock.json nx.json tsconfig*.json ./
COPY apps/sports-yeti-admin/package.json apps/sports-yeti-admin/
COPY ui/package.json ui/

RUN npm ci

# Bind mounts will overlay the workspace at runtime
COPY apps/sports-yeti-admin/ apps/sports-yeti-admin/
COPY ui/ ui/

# Note: do NOT set CI=1 here — Expo would treat it as a CI run and disable
# Metro's file watcher (i.e. no hot reload).

EXPOSE 19006

CMD ["npx", "expo", "start", "--port", "19006"]

# =============================================================================
# Stage 2: Production builder - export static web bundle
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /workspace

COPY package.json package-lock.json nx.json tsconfig*.json ./
COPY apps/sports-yeti-admin/ apps/sports-yeti-admin/
COPY ui/ ui/

RUN npm ci

ENV EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1

RUN npx nx export sports-yeti-admin --platform=web

# =============================================================================
# Stage 3: Production runtime - serve static files
# =============================================================================
FROM node:20-alpine AS prod

RUN npm install -g serve@14

WORKDIR /app

COPY --from=builder /workspace/apps/sports-yeti-admin/dist/ ./dist/

EXPOSE 19006

CMD ["serve", "-s", "dist", "-l", "19006"]

# =============================================================================
# Stage 1: Install deps and export static web build
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
# Stage 2: Serve static files
# =============================================================================
FROM node:20-alpine

RUN npm install -g serve@14

WORKDIR /app

COPY --from=builder /workspace/apps/sports-yeti-admin/dist/ ./dist/

EXPOSE 19006

CMD ["serve", "-s", "dist", "-l", "19006"]

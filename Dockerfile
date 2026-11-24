# syntax=docker/dockerfile:1
# Single production image for Railway: Express serves the API (/api) AND the React build.
#   docker build -t gym-app-prod .
# Node 22 (project requirement, "engines": ">=22"); Node 20 is end-of-life.
# The docker-compose.yml setup (nginx + API) is kept for local use only.

# ---- Manifests only: dependency layers stay cached until a package.json changes ----
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/

# ---- Stage 1: frontend-builder (React + Vite) ----
FROM base AS frontend-builder
RUN npm ci --workspace shared --workspace client --include-workspace-root=false
COPY shared/ shared/
COPY client/ client/
# Relative API URL: the same Express serves web and API, under whatever domain Railway assigns.
ENV VITE_API_URL=/api
RUN npm run build -w shared && npm run build -w client

# ---- Stage 2: backend-builder (compile TS, then keep production dependencies only) ----
FROM base AS backend-builder
# Toolchain only used if better-sqlite3 has no prebuilt binary for this platform.
RUN apk add --no-cache python3 make g++
RUN npm ci --workspace shared --workspace server --include-workspace-root=false
COPY shared/ shared/
COPY server/ server/
RUN npm run build -w shared && npm run build -w server \
 && rm -rf node_modules shared/node_modules server/node_modules \
 && npm ci --omit=dev --workspace server --include-workspace-root=false \
 && mkdir -p server/node_modules

# ---- Stage 3: production ----
FROM node:22-alpine AS production
# su-exec: drop root privileges after fixing the volume permissions (see docker-entrypoint.sh).
RUN apk add --no-cache su-exec
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATABASE_PATH=/app/data/database.sqlite \
    PUBLIC_DIR=/app/public
WORKDIR /app
COPY --from=backend-builder /app/node_modules node_modules
COPY --from=backend-builder /app/server/node_modules server/node_modules
COPY --from=backend-builder /app/shared/package.json shared/
COPY --from=backend-builder /app/shared/dist shared/dist
COPY --from=backend-builder /app/server/package.json server/
COPY --from=backend-builder /app/server/dist server/dist
COPY --from=frontend-builder /app/client/dist public
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# /app/data = mount point of the Railway volume (the SQLite file lives there).
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
 && mkdir -p /app/data \
 && chown node:node /app/data
WORKDIR /app/server
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
# Runs `node dist/server.js` directly (no npm): node gets SIGTERM from Railway.
ENTRYPOINT ["docker-entrypoint.sh"]

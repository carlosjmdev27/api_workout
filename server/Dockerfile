# syntax=docker/dockerfile:1
# API image. Build from the repo root: docker build -f server/Dockerfile .
# Node 22: the version the project requires (server "engines": ">=22"); Node 20 is end-of-life.

# ---- Base: manifests only, so dependency layers are cached until they change ----
FROM node:22-alpine AS base
WORKDIR /app
# Toolchain only used if better-sqlite3 has no prebuilt binary for this platform.
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/

# ---- Build: all deps of shared + server, then compile TypeScript ----
FROM base AS build
RUN npm ci --workspace shared --workspace server --include-workspace-root=false
COPY shared/ shared/
COPY server/ server/
RUN npm run build -w shared && npm run build -w server

# ---- Production dependencies only (no tsx, eslint, typescript…) ----
FROM base AS prod-deps
RUN npm ci --omit=dev --workspace server --include-workspace-root=false \
 && mkdir -p server/node_modules

# ---- Runtime: small image, non-root user ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules node_modules
COPY --from=prod-deps /app/server/node_modules server/node_modules
COPY --from=build /app/shared/package.json shared/
COPY --from=build /app/shared/dist shared/dist
COPY --from=build /app/server/package.json server/
COPY --from=build /app/server/dist server/dist
# The SQLite folder is the mount point of the persistent volume; owned by the non-root user
# so a fresh named volume inherits writable permissions.
RUN mkdir -p server/database && chown node:node server/database
USER node
WORKDIR /app/server
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "dist/server.js"]

# syntax=docker/dockerfile:1
# Web image. Build from the repo root: docker build -f client/Dockerfile .

# ---- Build: compile the React app with Vite ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
# Only what the web needs (skips better-sqlite3 and the rest of the API).
RUN npm ci --workspace shared --workspace client --include-workspace-root=false
COPY shared/ shared/
COPY client/ client/
# Same-origin by default: nginx proxies /api to the backend, so no CORS in the browser.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build -w shared && npm run build -w client

# ---- Runtime: static files served by nginx (~10-15 MB of RAM) ----
FROM nginx:1.28-alpine AS runtime
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -q --spider http://127.0.0.1/ || exit 1

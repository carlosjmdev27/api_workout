#!/bin/sh
# Railway (like most hosts) mounts volumes owned by root. Give the SQLite folder to the
# unprivileged "node" user, then drop privileges. `exec` replaces this shell, so node is
# PID 1 and receives Railway's SIGTERM directly (graceful shutdown closes SQLite cleanly).
set -e

APP="/app/server/dist/server.js"

if [ "$(id -u)" = "0" ]; then
  # Same resolution as the server: relative paths are relative to /app/server (WORKDIR).
  DB_DIR="$(dirname "${DATABASE_PATH:-/app/data/database.sqlite}")"
  mkdir -p "$DB_DIR"
  chown -R node:node "$DB_DIR"
  exec su-exec node node "$APP"
fi

exec node "$APP"

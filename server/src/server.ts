import { env } from './config/env.js';
import { buildContainer } from './container.js';

/** Railway sends SIGTERM and kills the process a few seconds later: never hang on shutdown. */
const SHUTDOWN_TIMEOUT_MS = 8_000;

const { app, close } = buildContainer(env);

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`API listening on http://${env.HOST}:${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`${signal} received, closing server...`);
  server.close(() => {
    close(); // Release the SQLite file cleanly (checkpoints the WAL).
    process.exit(0);
  });
  server.closeIdleConnections(); // Keep-alive sockets would otherwise delay close().
  setTimeout(() => {
    console.error('Graceful shutdown timed out, forcing exit');
    close();
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

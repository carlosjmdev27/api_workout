import { env } from './config/env.js';
import { buildContainer } from './container.js';

const { app, close } = buildContainer(env);

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`${signal} received, closing server...`);
  server.close(() => {
    close(); // Release the SQLite file cleanly.
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix: also reads non-VITE_ vars, which are NOT exposed to the browser bundle.
  const env = loadEnv(mode, '.', '');
  const port = Number(env.DEV_SERVER_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DEV_SERVER_PORT is missing or invalid. Copy client/.env.example to client/.env');
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port,
      strictPort: true, // Must match CORS_ORIGIN in server/.env.
    },
  };
});

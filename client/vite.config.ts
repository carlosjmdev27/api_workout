import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
function readDevPort(mode: string): number {
  // '' prefix: also reads non-VITE_ vars, which are NOT exposed to the browser bundle.
  const port = Number(loadEnv(mode, '.', '').DEV_SERVER_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DEV_SERVER_PORT is missing or invalid. Copy client/.env.example to client/.env');
  }
  return port;
}

export default defineConfig(({ command, mode }) => ({
  plugins: [react(), tailwindcss()],
  // "@/..." -> src/ (shadcn/ui convention, mirrors tsconfig "paths").
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // The dev port only matters for `vite` (serve), not for `vite build`.
  server:
    command === 'serve'
      ? { port: readDevPort(mode), strictPort: true } // Must match CORS_ORIGIN in server/.env.
      : undefined,
}));

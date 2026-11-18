import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { SERVER_ROOT } from './paths.js';

const ENV_FILE_PATH = resolve(SERVER_ROOT, '.env');

// Native Node loader (>= 20.12): avoids an extra dependency such as dotenv.
if (existsSync(ENV_FILE_PATH)) {
  process.loadEnvFile(ENV_FILE_PATH);
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535),
  CORS_ORIGIN: z.url(),
  DATABASE_PATH: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:\n', z.prettifyError(parsed.error));
    process.exit(1);
  }

  return parsed.data;
}

export const env: Env = loadEnv();

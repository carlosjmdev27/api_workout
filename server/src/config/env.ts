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
  /** Signs the session tokens. Long random value; changing it logs everybody out. */
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must have at least 32 characters')
    .refine((value) => !value.startsWith('change-me'), 'JWT_SECRET still has the .env.example placeholder'),
  /** Set to false once your accounts exist, to close public sign-up. */
  ALLOW_REGISTRATION: z.stringbool().default(true),
  /** Reverse proxies in front of the API (1 behind nginx in Docker), so rate limiting sees the real IP. */
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
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

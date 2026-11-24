import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { SERVER_ROOT } from './paths.js';

const ENV_FILE_PATH = resolve(SERVER_ROOT, '.env');

// Native Node loader (>= 20.12): avoids an extra dependency such as dotenv.
if (existsSync(ENV_FILE_PATH)) {
  process.loadEnvFile(ENV_FILE_PATH);
}

/** Hosting panels often leave a variable defined but empty: treat "" as "not set". */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  /** Railway (and most PaaS) inject PORT; 3000 locally. */
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  /** 0.0.0.0: reachable from outside the container (Railway routes public traffic to it). */
  HOST: z.string().min(1).default('0.0.0.0'),
  /**
   * Only needed when the web runs on another origin (Vite dev server). In production the
   * same Express serves web + API, so it is left unset and no CORS header is sent at all.
   */
  CORS_ORIGIN: optional(z.url()),
  /** SQLite file. Relative paths resolve from /server; on Railway an absolute path inside the volume. */
  DATABASE_PATH: z.string().min(1).default('./data/database.sqlite'),
  /** Built React app served by Express in production (relative to /server). */
  PUBLIC_DIR: z.string().min(1).default('../public'),
  /** Signs the session tokens. Long random value; changing it logs everybody out. */
  JWT_SECRET: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'JWT_SECRET is required: set a random value of at least 32 characters (Railway: Variables tab)'
          : 'JWT_SECRET must be a string',
    })
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

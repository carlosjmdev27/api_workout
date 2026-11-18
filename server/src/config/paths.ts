import { fileURLToPath } from 'node:url';

/**
 * Absolute path to the /server folder.
 * Works both from src/config (tsx) and dist/config (compiled), so the
 * .env file and the SQLite path never depend on the current working dir.
 */
export const SERVER_ROOT: string = fileURLToPath(new URL('../../', import.meta.url));

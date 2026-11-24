import { join, relative, sep } from 'node:path';
import express, { Router, type RequestHandler } from 'express';

/** Vite puts content-hashed files here: their URL changes whenever their content does. */
const HASHED_ASSETS_DIR = 'assets';
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/** /api, /api/... */
const isApiPath = (path: string): boolean => path === '/api' || path.startsWith('/api/');
/** "/assets/app.js", "/favicon.svg": a missing file must stay a 404, not become index.html. */
const looksLikeFile = (path: string): boolean => /\.[a-z0-9]+$/i.test(path);

/**
 * Serves the built React app in production (web + API on one origin, no CORS):
 * - static files, hashed assets cached for a year;
 * - any other GET/HEAD that is not /api and not a file -> index.html, so React Router
 *   can render deep links such as /routines/:id after a reload instead of a 404.
 */
export function serveSpa(publicDir: string): Router {
  const router = Router();
  const indexFile = join(publicDir, 'index.html');

  router.use(
    express.static(publicDir, {
      index: false, // "/" goes through the fallback below (same no-cache headers).
      setHeaders: (res, filePath) => {
        const isHashed = relative(publicDir, filePath).split(sep)[0] === HASHED_ASSETS_DIR;
        res.setHeader('Cache-Control', isHashed ? `public, max-age=${ONE_YEAR_SECONDS}, immutable` : 'no-cache');
      },
    }),
  );

  const fallback: RequestHandler = (req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || isApiPath(req.path) || looksLikeFile(req.path)) {
      next();
      return;
    }
    // index.html is tiny and points to hashed assets: always revalidate it so a deploy shows up at once.
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(indexFile);
  };
  router.use(fallback);

  return router;
}

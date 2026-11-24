import cors from 'cors';
import type { RequestHandler } from 'express';
import helmet from 'helmet';

/**
 * Secure HTTP headers (+ CORS limited to the exact frontend origin, only when the web
 * runs on another origin). Without CORS headers browsers block every cross-origin call,
 * which is exactly what production (web + API on one origin) needs.
 */
export function securityMiddlewares(allowedOrigin: string | undefined): RequestHandler[] {
  const middlewares: RequestHandler[] = [helmet()];
  if (allowedOrigin) {
    middlewares.push(
      cors({
        origin: allowedOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 600, // Cache preflight responses for 10 minutes.
      }),
    );
  }
  return middlewares;
}

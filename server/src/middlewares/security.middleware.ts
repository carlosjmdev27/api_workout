import cors from 'cors';
import type { RequestHandler } from 'express';
import helmet from 'helmet';

/** Secure HTTP headers + CORS limited to the exact frontend origin. */
export function securityMiddlewares(allowedOrigin: string): RequestHandler[] {
  return [
    helmet(),
    cors({
      origin: allowedOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600, // Cache preflight responses for 10 minutes.
    }),
  ];
}

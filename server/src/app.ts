import express, { type Express, type Request, type Response } from 'express';

/**
 * Builds the Express application.
 * Security middlewares (helmet, cors, error handler) and the CRUD routes
 * are wired in Phase 2.
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ success: true, data: { status: 'ok' } });
  });

  return app;
}

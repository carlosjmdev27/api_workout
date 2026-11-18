import { Router } from 'express';
import { sendSuccess } from '../controllers/response.js';

export function createHealthRouter(): Router {
  const router = Router();
  router.get('/health', (_req, res) => sendSuccess(res, 200, { status: 'ok' }));
  return router;
}

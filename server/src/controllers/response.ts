import type { Response } from 'express';
import type { ApiSuccess } from '../types/api.types.js';

/** Sends the standard success envelope: { success: true, data }. */
export function sendSuccess<T>(res: Response, status: number, data: T): void {
  const body: ApiSuccess<T> = { success: true, data };
  res.status(status).json(body);
}

export function sendNoContent(res: Response): void {
  res.status(204).end();
}

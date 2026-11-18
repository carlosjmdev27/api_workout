import type { RequestHandler } from 'express';
import type { z } from 'zod';

/**
 * Validates and normalizes req.body before it reaches the controller.
 * On failure the ZodError goes to the global error handler (400).
 */
export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}

/** Validates route params (e.g. that ids are UUIDs). */
export function validateParams(schema: z.ZodType<Record<string, string>>): RequestHandler {
  return (req, _res, next) => {
    req.params = schema.parse(req.params);
    next();
  };
}

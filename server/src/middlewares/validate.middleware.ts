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

/**
 * Validates the query string. Express 5 exposes req.query as a read-only getter,
 * so the parsed value is defined as an own property of this request.
 */
export function validateQuery(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const parsed: unknown = schema.parse(req.query);
    Object.defineProperty(req, 'query', { value: parsed, writable: true, enumerable: true });
    next();
  };
}

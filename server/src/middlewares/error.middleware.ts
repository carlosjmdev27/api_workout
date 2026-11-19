import type { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import type { ApiError } from '@gym/shared';

interface HttpErrorShape {
  status: number;
  type: string;
}

/** Errors thrown by express.json() (malformed JSON, payload too large...). */
function isBodyParserError(error: unknown): error is HttpErrorShape {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number' &&
    'type' in error &&
    typeof error.type === 'string'
  );
}

function buildBody(code: string, message: string, extra: Partial<ApiError['error']> = {}): ApiError {
  return { success: false, error: { code, message, ...extra } };
}

function toResponse(error: unknown): { status: number; body: ApiError } {
  if (error instanceof AppError) {
    return { status: error.statusCode, body: buildBody(error.code, error.message) };
  }
  if (error instanceof z.ZodError) {
    const details = error.issues.map((issue) => ({
      path: issue.path.map(String).join('.'),
      message: issue.message,
    }));
    return { status: 400, body: buildBody('VALIDATION_ERROR', 'Invalid request data', { details }) };
  }
  if (isBodyParserError(error)) {
    if (error.type === 'entity.too.large') {
      return { status: 413, body: buildBody('PAYLOAD_TOO_LARGE', 'Request body is too large') };
    }
    if (error.type === 'entity.parse.failed') {
      return { status: 400, body: buildBody('INVALID_JSON', 'Malformed JSON body') };
    }
  }
  return { status: 500, body: buildBody('INTERNAL_ERROR', 'Unexpected server error') };
}

/** Global error handler: standard JSON shape, no stack traces in production. */
export function errorHandler(isProduction: boolean): ErrorRequestHandler {
  return (error: unknown, _req, res, _next) => {
    const { status, body } = toResponse(error);

    if (status >= 500) {
      console.error(error); // Full detail stays in the server logs only.
      if (!isProduction && error instanceof Error && error.stack) {
        body.error.stack = error.stack;
      }
    }
    res.status(status).json(body);
  };
}

/** 404 for any route that does not exist. */
export const notFoundHandler: RequestHandler = (req, res) => {
  const body = buildBody('ROUTE_NOT_FOUND', `Route ${req.method} ${req.path} not found`);
  res.status(404).json(body);
};

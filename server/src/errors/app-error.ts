/**
 * Expected (operational) error. Its code and message are safe to send
 * to the client; any other error is treated as an internal 500.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/** Missing, invalid or expired credentials / token. */
export class UnauthorizedError extends AppError {
  constructor(code: string, message: string) {
    super(401, code, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(code: string, message: string) {
    super(403, code, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(code: string, message: string) {
    super(404, code, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string) {
    super(409, code, message);
    this.name = 'ConflictError';
  }
}

export class BusinessRuleError extends AppError {
  constructor(code: string, message: string) {
    super(422, code, message);
    this.name = 'BusinessRuleError';
  }
}

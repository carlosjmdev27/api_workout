import type { ApiErrorBody, ApiErrorDetail, ApiSuccess } from '../types/api';

function readApiUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    throw new Error('VITE_API_URL is not defined. Copy client/.env.example to client/.env');
  }
  return url.replace(/\/+$/, ''); // Tolerate a trailing slash.
}

const BASE_URL: string = readApiUrl();

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Error raised for any failed API call (HTTP error, network down, bad response). */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function isErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    body.success === false &&
    'error' in body &&
    typeof body.error === 'object' &&
    body.error !== null
  );
}

function isSuccessBody(body: unknown): body is ApiSuccess<unknown> {
  return typeof body === 'object' && body !== null && 'success' in body && body.success === true;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function send(method: HttpMethod, path: string, body?: unknown): Promise<Response> {
  const hasBody = body !== undefined;
  try {
    return await fetch(`${BASE_URL}${path}`, {
      method,
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'Could not reach the API');
  }
}

async function toApiError(response: Response): Promise<ApiRequestError> {
  const body = await readJson(response);
  if (isErrorBody(body)) {
    const { code, message, details } = body.error;
    return new ApiRequestError(response.status, code, message, details);
  }
  return new ApiRequestError(response.status, 'UNKNOWN_ERROR', response.statusText);
}

/** Performs a request and returns the `data` field of the success envelope. */
export async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const response = await send(method, path, body);
  if (!response.ok) throw await toApiError(response);

  const json = await readJson(response);
  if (!isSuccessBody(json)) {
    throw new ApiRequestError(response.status, 'INVALID_RESPONSE', 'Unexpected API response');
  }
  // Typed by contract: shapes mirror the server types (see src/types).
  return json.data as T;
}

/** For endpoints that answer 204 No Content. */
export async function requestVoid(method: HttpMethod, path: string): Promise<void> {
  const response = await send(method, path);
  if (!response.ok) throw await toApiError(response);
}

import type { ApiError as ApiErrorBody, ApiErrorDetail, ApiSuccess } from '@gym/shared';
import { clearToken, getToken, notifySessionExpired } from './auth-token';

/** Production builds served by the API itself use a relative URL: works under any domain, no CORS. */
const PRODUCTION_API_URL = '/api';

function readApiUrl(): string {
  const url = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PRODUCTION_API_URL : undefined);
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
  const token = getToken();
  const headers: Record<string, string> = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'Could not reach the API');
  }
  // Our token was rejected (expired / invalid): end the session everywhere.
  // A 401 without token (wrong password at login) is just a normal error.
  if (response.status === 401 && token) {
    clearToken();
    notifySessionExpired();
  }
  return response;
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

/** 204 No Content endpoints that take a JSON body (e.g. change password). */
export async function requestVoidWithBody(method: HttpMethod, path: string, body: unknown): Promise<void> {
  const response = await send(method, path, body);
  if (!response.ok) throw await toApiError(response);
}

/** Standard envelope for every successful API response. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

/** Standard envelope for every error response. */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    stack?: string; // Only outside production.
  };
}

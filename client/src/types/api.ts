// Mirrors server/src/types/api.types.ts (response envelope).

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

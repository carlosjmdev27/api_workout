// DUPLICATED in server/src/types/api.types.ts — keep both in sync (PROJECT_DOC pending #1).

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

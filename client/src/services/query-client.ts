import { QueryClient } from '@tanstack/react-query';
import { ApiRequestError } from './http-client';

const MAX_RETRIES = 2;

/** Client errors (4xx) are final: retrying would give the same answer. */
function shouldRetry(failureCount: number, error: Error): boolean {
  const isClientError =
    error instanceof ApiRequestError && error.status >= 400 && error.status < 500;
  return !isClientError && failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
});

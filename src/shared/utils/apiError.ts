import type { ApiError } from '@/shared/types/api';

export class FeatureApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'FeatureApiError';
  }
}

/** True only when the backend explicitly answered 404 (resource not found). */
export function isApiNotFound(error: unknown): boolean {
  return error instanceof FeatureApiError && error.status === 404;
}

/** Redirect to /500 on server errors (client-side only, with loop protection) */
function redirectToServerError() {
  if (
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith('/500') &&
    !window.location.pathname.startsWith('/maintenance')
  ) {
    window.location.href = '/500';
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (response.status >= 500) {
    redirectToServerError();
    throw new FeatureApiError(`Server error ${response.status}`, response.status);
  }

  const data: unknown = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    const message = error.code ?? error.error ?? `Error ${response.status}`;
    throw new FeatureApiError(message, response.status, error.code);
  }

  return (data as { data: T }).data;
}

/**
 * Wraps a fetch call to detect network failures (backend unreachable).
 * Use this around raw `fetch()` calls to catch TypeError: Failed to fetch.
 */
export async function safeFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (error instanceof TypeError) {
      redirectToServerError();
    }
    throw error;
  }
}

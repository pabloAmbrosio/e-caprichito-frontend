import type { ApiError } from '../../domain/types';

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    const message = error.code ?? error.error ?? `Error ${response.status}`;
    throw new AuthApiError(message, response.status, error.code);
  }

  return data as T;
}

import { refreshToken as refreshTokenApi } from './authApi';

type GetAccessToken = () => string | null;
type SetAccessToken = (token: string) => void;
type OnSessionExpired = () => void;

interface AuthFetchConfig {
  getAccessToken: GetAccessToken;
  setAccessToken: SetAccessToken;
  onSessionExpired: OnSessionExpired;
}

let config: AuthFetchConfig | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export function configureAuthFetch(cfg: AuthFetchConfig): void {
  config = cfg;
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (!config) {
    throw new Error('authFetch no configurado. Llama a configureAuthFetch primero.');
  }

  const response = await executeWithAuth(input, init);

  if (response.status !== 401) {
    return response;
  }

  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  if (url.includes('/api/auth/refresh')) {
    config.onSessionExpired();
    return response;
  }

  try {
    const newToken = await doRefreshOnce();
    config.setAccessToken(newToken);
    return executeWithAuth(input, init);
  } catch {
    config.onSessionExpired();
    return response;
  }
}

function executeWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = config!.getAccessToken();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}

async function doRefreshOnce(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const token = config!.getAccessToken();
      const result = await refreshTokenApi(token);
      return result.data.accessToken;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

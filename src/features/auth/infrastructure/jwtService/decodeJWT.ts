import type { JWTPayload } from '../../domain/types';

export function decodeJWT(token: string): JWTPayload {
  const parts = token.split('.');
  const payload = parts[1];
  if (!payload) {
    throw new Error('Token JWT inválido');
  }
  const decoded = atob(payload);
  return JSON.parse(decoded) as JWTPayload;
}

import { decodeJWT } from './decodeJWT';

const REFRESH_THRESHOLD = 0.80;

export function isInRefreshZone(token: string): boolean {
  const payload = decodeJWT(token);
  const now = Math.floor(Date.now() / 1000);
  const totalLifetime = payload.exp - payload.iat;
  const refreshAt = payload.iat + totalLifetime * REFRESH_THRESHOLD;
  return now >= refreshAt;
}

import { decodeJWT } from './decodeJWT';

const REFRESH_THRESHOLD = 0.80;

export function getTimeUntilRefresh(token: string): number {
  const payload = decodeJWT(token);
  const now = Math.floor(Date.now() / 1000);
  const totalLifetime = payload.exp - payload.iat;
  const refreshAt = payload.iat + totalLifetime * REFRESH_THRESHOLD;
  const timeUntilRefresh = (refreshAt - now) * 1000;
  return Math.max(timeUntilRefresh, 0);
}

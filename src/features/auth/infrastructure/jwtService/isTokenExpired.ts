import { decodeJWT } from './decodeJWT';

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp;
}

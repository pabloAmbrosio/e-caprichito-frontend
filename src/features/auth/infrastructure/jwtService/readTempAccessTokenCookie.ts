export function readTempAccessTokenCookie(): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('temp_access_token='));
  if (!match) return null;
  const value = match.split('=')[1];
  return value || null;
}

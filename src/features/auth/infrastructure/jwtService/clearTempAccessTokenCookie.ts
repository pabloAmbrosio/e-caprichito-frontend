export function clearTempAccessTokenCookie(): void {
  document.cookie = 'temp_access_token=; path=/; max-age=0';
}

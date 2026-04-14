export type BroadcastMessageType = 'TOKEN_REFRESHED' | 'LOGOUT' | 'REFRESH_STARTED';

export type BroadcastMessage =
  | { type: 'TOKEN_REFRESHED'; accessToken: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_STARTED' };

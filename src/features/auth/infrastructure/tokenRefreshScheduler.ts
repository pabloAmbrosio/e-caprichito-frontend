import type { BroadcastMessage } from '../domain/types';
import { getTimeUntilRefresh, isTokenExpired, isInRefreshZone } from './jwtService';

interface SchedulerCallbacks {
  onTokenRefreshed: (newToken: string) => void;
  onSessionExpired: () => void;
  getAccessToken: () => string | null;
  doRefresh: () => Promise<string>;
}

const BROADCAST_CHANNEL_NAME = 'auth';
const REFRESH_STARTED_WAIT_MS = 5000;

export class TokenRefreshScheduler {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private channel: BroadcastChannel | null = null;
  private callbacks: SchedulerCallbacks;
  private isRefreshingFromBroadcast = false;
  private refreshStartedTimerId: ReturnType<typeof setTimeout> | null = null;
  private boundHandleVisibility: () => void;

  constructor(callbacks: SchedulerCallbacks) {
    this.callbacks = callbacks;
    this.boundHandleVisibility = this.handleVisibilityChange.bind(this);
  }

  start(token: string): void {
    this.stop();
    this.initBroadcastChannel();
    document.addEventListener('visibilitychange', this.boundHandleVisibility);
    this.scheduleRefresh(token);
  }

  stop(): void {
    this.clearTimer();
    this.clearRefreshStartedTimer();
    document.removeEventListener('visibilitychange', this.boundHandleVisibility);
    this.destroyBroadcastChannel();
  }

  restartWithToken(token: string): void {
    this.clearTimer();
    this.scheduleRefresh(token);
  }

  private scheduleRefresh(token: string): void {
    const delay = getTimeUntilRefresh(token);
    this.timerId = setTimeout(() => {
      void this.executeRefresh();
    }, delay);
  }

  private async executeRefresh(): Promise<void> {
    this.broadcastMessage({ type: 'REFRESH_STARTED' });

    try {
      const newToken = await this.callbacks.doRefresh();
      this.callbacks.onTokenRefreshed(newToken);
      this.broadcastMessage({ type: 'TOKEN_REFRESHED', accessToken: newToken });
      this.scheduleRefresh(newToken);
    } catch {
      this.callbacks.onSessionExpired();
      this.broadcastMessage({ type: 'LOGOUT' });
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.clearTimer();
      return;
    }

    const token = this.callbacks.getAccessToken();
    if (!token) return;

    if (isTokenExpired(token) || isInRefreshZone(token)) {
      void this.executeRefresh();
    } else {
      this.scheduleRefresh(token);
    }
  }

  private initBroadcastChannel(): void {
    if (typeof BroadcastChannel === 'undefined') return;

    this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    this.channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      this.handleBroadcast(event.data);
    };
  }

  private handleBroadcast(message: BroadcastMessage): void {
    switch (message.type) {
      case 'TOKEN_REFRESHED':
        this.clearRefreshStartedTimer();
        this.isRefreshingFromBroadcast = false;
        this.callbacks.onTokenRefreshed(message.accessToken);
        this.clearTimer();
        this.scheduleRefresh(message.accessToken);
        break;

      case 'LOGOUT':
        this.stop();
        this.callbacks.onSessionExpired();
        break;

      case 'REFRESH_STARTED':
        this.clearTimer();
        this.isRefreshingFromBroadcast = true;
        this.refreshStartedTimerId = setTimeout(() => {
          this.isRefreshingFromBroadcast = false;
          const token = this.callbacks.getAccessToken();
          if (token) {
            void this.executeRefresh();
          }
        }, REFRESH_STARTED_WAIT_MS);
        break;
    }
  }

  private broadcastMessage(message: BroadcastMessage): void {
    this.channel?.postMessage(message);
  }

  private destroyBroadcastChannel(): void {
    this.channel?.close();
    this.channel = null;
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private clearRefreshStartedTimer(): void {
    if (this.refreshStartedTimerId !== null) {
      clearTimeout(this.refreshStartedTimerId);
      this.refreshStartedTimerId = null;
    }
  }
}

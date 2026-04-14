import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning';
  message: string;
  href?: string;
  createdAt: number;
}

interface NotificationState {
  notifications: AppNotification[];
  push: (n: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  dismiss: (id: string) => void;
}

let counter = 0;

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  push: (n) => {
    const id = `notif-${++counter}-${Date.now()}`;
    const notification: AppNotification = { ...n, id, createdAt: Date.now() };
    set((s) => ({ notifications: [...s.notifications, notification] }));

    // Auto-dismiss after 6s
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) }));
    }, 6000);
  },

  dismiss: (id) => {
    set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) }));
  },
}));

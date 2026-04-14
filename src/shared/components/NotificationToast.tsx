import Link from 'next/link';
import { useNotificationStore } from '@/shared/store/notificationStore';
import type { AppNotification } from '@/shared/store/notificationStore';

const STYLES: Record<AppNotification['type'], { bg: string; border: string; accent: string }> = {
  info: {
    bg: 'rgba(0,197,212,0.08)',
    border: 'rgba(0,197,212,0.25)',
    accent: '#00C5D4',
  },
  success: {
    bg: 'rgba(76,175,80,0.08)',
    border: 'rgba(76,175,80,0.25)',
    accent: '#4CAF50',
  },
  warning: {
    bg: 'rgba(240,23,122,0.08)',
    border: 'rgba(240,23,122,0.25)',
    accent: '#F0177A',
  },
};

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function NotificationItem({ notification }: { notification: AppNotification }) {
  const dismiss = useNotificationStore((s) => s.dismiss);
  const style = STYLES[notification.type];

  const content = (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg backdrop-blur-sm animate-[slideInRight_0.3s_ease-out]"
      style={{ background: style.bg, borderColor: style.border, color: style.accent }}
    >
      <span className="animate-pulse">⚡</span>
      <span className="flex-1 min-w-0">{notification.message}</span>
      {notification.href && (
        <span className="text-xs font-bold underline underline-offset-2 shrink-0">Ver</span>
      )}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(notification.id); }}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Cerrar notificación"
      >
        <CloseIcon />
      </button>
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} className="block hover:scale-[1.01] transition-transform duration-150">
        {content}
      </Link>
    );
  }

  return content;
}

export function NotificationToast() {
  const notifications = useNotificationStore((s) => s.notifications);

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(24rem,calc(100vw-2rem))]"
      role="log"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}

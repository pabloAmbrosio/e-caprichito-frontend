/**
 * Sends a native browser notification if the tab is not focused.
 * Only works after permission has been granted via `requestNotificationPermission()`.
 */
export function sendNativeNotification(title: string, body: string, onClick?: () => void): void {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (document.hasFocus()) return;

  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
  });

  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }
}

/**
 * Requests notification permission from the browser.
 * Call once when BackofficeLayout mounts.
 */
export function requestNotificationPermission(): void {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    void Notification.requestPermission();
  }
}

import { useEffect, useCallback } from 'react';
import { onOrderCreated, offOrderCreated } from '../infrastructure/staffSocket';
import { useNotificationStore } from '@/shared/store/notificationStore';
import { sendNativeNotification } from '@/shared/utils/nativeNotification';
import type { OrderCreatedNotification } from '../infrastructure/staffSocket';

/**
 * Listens for `order:created` socket events.
 * Shows a toast notification when a new order is placed.
 * Called from BackofficeLayout (global toast for all backoffice pages).
 */
export function useOrderCreatedListener(onOrderReceived?: () => void): void {
  const push = useNotificationStore((s) => s.push);

  const handler = useCallback((data: OrderCreatedNotification) => {
    const total = (data.total / 100).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const message = `Nueva orden de @${data.customerUsername} — $${total}`;

    push({
      type: 'info',
      message,
      href: `/backoffice/orders/${data.orderId}`,
    });

    sendNativeNotification('La Central — Nueva Orden', message, () => {
      window.location.href = `/backoffice/orders/${data.orderId}`;
    });

    onOrderReceived?.();
  }, [push, onOrderReceived]);

  useEffect(() => {
    onOrderCreated(handler);
    return () => {
      offOrderCreated(handler);
    };
  }, [handler]);
}

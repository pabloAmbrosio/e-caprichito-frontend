import { useEffect, useCallback } from 'react';
import { onPaymentProofUploaded, offPaymentProofUploaded } from '../infrastructure/staffSocket';
import { useNotificationStore } from '@/shared/store/notificationStore';
import { sendNativeNotification } from '@/shared/utils/nativeNotification';
import type { PaymentProofNotification } from '../infrastructure/staffSocket';

/**
 * Listens for `payment:proof-uploaded` socket events.
 * Shows a toast notification and optionally triggers a refetch callback.
 * Called from BackofficeLayout (global toast for all backoffice pages).
 */
export function usePaymentProofListener(onProofReceived?: () => void): void {
  const push = useNotificationStore((s) => s.push);

  const handler = useCallback((data: PaymentProofNotification) => {
    const amount = (data.amount / 100).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const message = `Nuevo comprobante recibido — $${amount}`;

    push({
      type: 'warning',
      message,
      href: `/backoffice/payments/${data.paymentId}`,
    });

    sendNativeNotification('La Central — Pago', message, () => {
      window.location.href = `/backoffice/payments/${data.paymentId}`;
    });

    onProofReceived?.();
  }, [push, onProofReceived]);

  useEffect(() => {
    onPaymentProofUploaded(handler);
    return () => {
      offPaymentProofUploaded(handler);
    };
  }, [handler]);
}

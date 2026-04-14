import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/features/auth';
import {
  connectOrderSocket,
  disconnectOrderSocket,
  onOrderCancelled,
  offOrderCancelled,
  type OrderCancelledPayload,
} from '../infrastructure/orderSocket';

export function useOrderCancelled(
  orderId: string,
  onCancel: (data: OrderCancelledPayload) => void,
): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  const handler = useCallback(
    (data: OrderCancelledPayload) => {
      if (data.orderId === orderId) {
        onCancelRef.current(data);
      }
    },
    [orderId],
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    connectOrderSocket();
    onOrderCancelled(handler);

    return () => {
      offOrderCancelled(handler);
      disconnectOrderSocket();
    };
  }, [isAuthenticated, handler]);
}

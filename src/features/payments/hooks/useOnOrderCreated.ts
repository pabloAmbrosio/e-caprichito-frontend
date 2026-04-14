import { useEffect, useCallback, useRef } from 'react';
import { onOrderCreated, offOrderCreated } from '../infrastructure/staffSocket';
import type { OrderCreatedNotification } from '../infrastructure/staffSocket';

/**
 * Subscribes to `order:created` events and calls the provided callback.
 * Use this in pages that need to refresh data when a new order arrives.
 * The toast notification is already handled globally by BackofficeLayout.
 */
export function useOnOrderCreated(callback: (data: OrderCreatedNotification) => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const handler = useCallback((data: OrderCreatedNotification) => {
    callbackRef.current(data);
  }, []);

  useEffect(() => {
    onOrderCreated(handler);
    return () => {
      offOrderCreated(handler);
    };
  }, [handler]);
}

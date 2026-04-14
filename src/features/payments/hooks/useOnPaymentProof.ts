import { useEffect, useCallback, useRef } from 'react';
import { onPaymentProofUploaded, offPaymentProofUploaded } from '../infrastructure/staffSocket';
import type { PaymentProofNotification } from '../infrastructure/staffSocket';

/**
 * Subscribes to `payment:proof-uploaded` events and calls the provided callback.
 * Use this in pages that need to refresh data when a proof is uploaded.
 * The toast notification is already handled globally by BackofficeLayout.
 */
export function useOnPaymentProof(callback: (data: PaymentProofNotification) => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const handler = useCallback((data: PaymentProofNotification) => {
    callbackRef.current(data);
  }, []);

  useEffect(() => {
    onPaymentProofUploaded(handler);
    return () => {
      offPaymentProofUploaded(handler);
    };
  }, [handler]);
}

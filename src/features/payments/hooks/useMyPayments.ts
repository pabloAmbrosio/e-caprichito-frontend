import { useState, useEffect, useCallback } from 'react';
import { createPaymentApi } from '../infrastructure/paymentApi';
import { getPaymentByOrder } from '../infrastructure/paymentApi/getPaymentByOrder';
import type { Payment } from '../domain/types';

const paymentApi = createPaymentApi();

interface UseMyPaymentsReturn {
  payment: Payment | null;
  isLoading: boolean;
  error: string | null;
  createPayment: () => Promise<Payment>;
  uploadProof: (data: { screenshotUrl: string; bankReference?: string }) => Promise<Payment>;
  refresh: () => Promise<void>;
}

/**
 * Manages the payment flow for a specific order.
 * Fetches the payment associated with the given orderId and provides
 * actions for creating a payment and uploading proof.
 */
export function useMyPayments(orderId: string): UseMyPaymentsReturn {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayment = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const found = await getPaymentByOrder(orderId);
      setPayment(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el pago');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchPayment();
  }, [fetchPayment]);

  const createPayment = useCallback(async (): Promise<Payment> => {
    const result = await paymentApi.create(orderId, 'MANUAL_TRANSFER');
    setPayment(result);
    return result;
  }, [orderId]);

  const uploadProof = useCallback(
    async (data: { screenshotUrl: string; bankReference?: string }): Promise<Payment> => {
      if (!payment) throw new Error('No se encontró el pago para subir comprobante');
      const result = await paymentApi.uploadProof(payment.id, data);
      setPayment(result);
      return result;
    },
    [payment],
  );

  return { payment, isLoading, error, createPayment, uploadProof, refresh: fetchPayment };
}

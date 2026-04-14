import { useState, useEffect, useCallback } from 'react';
import { createOrderApi } from '../infrastructure/orderApi';
import type { PaymentInfo } from '../domain/types';

const orderApi = createOrderApi();

interface UsePaymentInfoReturn {
  paymentInfo: PaymentInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePaymentInfo(orderId: string): UsePaymentInfoReturn {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await orderApi.getPaymentInfo(orderId);
      setPaymentInfo(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la información de pago');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchPaymentInfo();
  }, [fetchPaymentInfo]);

  return { paymentInfo, isLoading, error, refetch: fetchPaymentInfo };
}

import { useState, useEffect, useCallback } from 'react';
import { createOrderApi } from '../infrastructure/orderApi';
import type { MyOrder, CancelOrderResult } from '../domain/types';
import type { ShipmentStatus } from '@/shared/types/enums';

const orderApi = createOrderApi();

interface UseOrderDetailReturn {
  order: MyOrder | null;
  isLoading: boolean;
  error: string | null;
  cancelOrder: () => Promise<CancelOrderResult>;
  refresh: () => Promise<void>;
  updateShipmentStatus: (status: ShipmentStatus) => void;
}

export function useOrderDetail(orderId: string): UseOrderDetailReturn {
  const [order, setOrder] = useState<MyOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const found = await orderApi.getById(orderId);
      setOrder(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el pedido');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  const cancelOrder = useCallback(async (): Promise<CancelOrderResult> => {
    const result = await orderApi.cancel(orderId);
    void fetchOrder();
    return result;
  }, [orderId, fetchOrder]);

  const updateShipmentStatus = useCallback((status: ShipmentStatus) => {
    setOrder((prev) => {
      if (!prev?.shipment) return prev;
      return { ...prev, shipment: { ...prev.shipment, status } };
    });
  }, []);

  return { order, isLoading, error, cancelOrder, refresh: fetchOrder, updateShipmentStatus };
}

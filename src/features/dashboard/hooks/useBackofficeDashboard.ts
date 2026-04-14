import { useState, useCallback } from 'react';
import { createPaymentApi } from '@/features/payments/infrastructure/paymentApi';
import { createOrderApi } from '@/features/orders/infrastructure/orderApi';
import { createShipmentApi } from '@/features/orders/infrastructure/shipmentApi';

const paymentApi = createPaymentApi();
const orderApi = createOrderApi();
const shipmentApi = createShipmentApi();

interface DashboardCounts {
  paymentsToReview: number;
  shipmentsToAdvance: number;
  pendingOrders: number;
}

interface DashboardState {
  counts: DashboardCounts;
  isLoading: boolean;
  error: string | null;
}

export function useBackofficeDashboard() {
  const [state, setState] = useState<DashboardState>({
    counts: { paymentsToReview: 0, shipmentsToAdvance: 0, pendingOrders: 0 },
    isLoading: false,
    error: null,
  });

  const fetchCounts = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const [paymentsRes, shipmentsAllRes, shipmentsDeliveredRes, shipmentsFailedRes, ordersRes] = await Promise.all([
        paymentApi.backofficeList({ status: 'AWAITING_REVIEW', limit: 1 }),
        shipmentApi.backofficeList({ limit: 1 }),
        shipmentApi.backofficeList({ limit: 1, status: 'DELIVERED' }),
        shipmentApi.backofficeList({ limit: 1, status: 'FAILED' }),
        orderApi.backofficeList({ status: 'PENDING', limit: 1 }),
      ]);

      const paymentPag = paymentsRes.pagination as Record<string, unknown> | null;
      const paymentsToReview = Number(paymentPag?.['totalItems'] ?? paymentPag?.['total'] ?? 0);

      const shipmentTotal = Number(
        shipmentsAllRes.pagination?.totalItems ?? shipmentsAllRes.pagination?.total ?? 0,
      );
      const deliveredCount = Number(
        shipmentsDeliveredRes.pagination?.totalItems ?? shipmentsDeliveredRes.pagination?.total ?? 0,
      );
      const failedCount = Number(
        shipmentsFailedRes.pagination?.totalItems ?? shipmentsFailedRes.pagination?.total ?? 0,
      );
      const shipmentsToAdvance = shipmentTotal - deliveredCount - failedCount;

      const pendingOrders = Number(
        ordersRes.pagination?.totalItems ?? ordersRes.pagination?.total ?? 0,
      );

      setState({
        counts: { paymentsToReview, shipmentsToAdvance, pendingOrders },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar dashboard';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  return { ...state, fetchCounts };
}

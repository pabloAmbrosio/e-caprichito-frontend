import { useState, useCallback } from 'react';
import { createShipmentApi } from '../infrastructure/shipmentApi';
import type { BackofficeShipmentListItem } from '../domain/types';
import type { ShipmentStatus, DeliveryType } from '@/shared/types/enums';
import type { Pagination } from '@/shared/types/api';

const api = createShipmentApi();

interface State {
  shipments: BackofficeShipmentListItem[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

export function useBackofficeShipments() {
  const [state, setState] = useState<State>({
    shipments: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const fetchShipments = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: ShipmentStatus;
    type?: DeliveryType;
  }) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.backofficeList(params);
      setState({ shipments: data.items, pagination: data.pagination, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar envíos';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  return { ...state, fetchShipments };
}

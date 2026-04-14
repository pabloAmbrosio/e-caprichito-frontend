import { useState, useCallback } from 'react';
import { createShipmentApi } from '../infrastructure/shipmentApi';
import type { UpdateShipmentPayload } from '../infrastructure/shipmentApi';
import type { BackofficeShipmentDetail } from '../domain/types';

const api = createShipmentApi();

interface State {
  shipment: BackofficeShipmentDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export function useBackofficeShipmentDetail() {
  const [state, setState] = useState<State>({
    shipment: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  const fetchShipment = useCallback(async (id: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.backofficeGetById(id);
      setState({ shipment: data, isLoading: false, isSaving: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el envío';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const advanceShipment = useCallback(async (id: string, note?: string) => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const updated = await api.backofficeAdvance(id, note);
      setState((s) => ({ ...s, isSaving: false, shipment: updated }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al avanzar el envío';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const failShipment = useCallback(async (id: string, note: string) => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const updated = await api.backofficeFail(id, note);
      setState((s) => ({ ...s, isSaving: false, shipment: updated }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al reportar fallo';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  const updateShipment = useCallback(async (id: string, payload: UpdateShipmentPayload) => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const updated = await api.backofficeUpdate(id, payload);
      setState((s) => ({ ...s, isSaving: false, shipment: updated }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el envío';
      setState((s) => ({ ...s, isSaving: false, error: msg }));
      throw err;
    }
  }, []);

  return { ...state, fetchShipment, advanceShipment, failShipment, updateShipment };
}

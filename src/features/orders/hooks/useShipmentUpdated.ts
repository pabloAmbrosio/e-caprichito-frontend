import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/features/auth';
import {
  connectShipmentSocket,
  disconnectShipmentSocket,
  onShipmentUpdated,
  offShipmentUpdated,
  type ShipmentUpdatedPayload,
} from '../infrastructure/shipmentSocket';

export function useShipmentUpdated(
  orderId: string,
  onUpdate: (data: ShipmentUpdatedPayload) => void,
): void {
  const accessToken = useAuthStore((s) => s.accessToken);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const handler = useCallback(
    (data: ShipmentUpdatedPayload) => {
      if (data.orderId === orderId) {
        onUpdateRef.current(data);
      }
    },
    [orderId],
  );

  useEffect(() => {
    if (!accessToken) return;

    connectShipmentSocket(accessToken);
    onShipmentUpdated(handler);

    return () => {
      offShipmentUpdated(handler);
      disconnectShipmentSocket();
    };
  }, [accessToken, handler]);
}

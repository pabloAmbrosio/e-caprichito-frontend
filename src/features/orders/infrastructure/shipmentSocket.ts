import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { ShipmentStatus } from '@/shared/types/enums';

export interface ShipmentUpdatedPayload {
  orderId: string;
  shipmentId: string;
  status: ShipmentStatus;
  note?: string;
}

type ShipmentUpdatedCallback = (data: ShipmentUpdatedPayload) => void;

let socket: Socket | null = null;
const pendingListeners = new Set<ShipmentUpdatedCallback>();

export function connectShipmentSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000', {
    auth: { token },
  });

  for (const cb of pendingListeners) {
    socket.on('shipment:updated', cb);
  }
  pendingListeners.clear();

  return socket;
}

export function disconnectShipmentSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function onShipmentUpdated(callback: ShipmentUpdatedCallback): void {
  if (socket) {
    socket.on('shipment:updated', callback);
  } else {
    pendingListeners.add(callback);
  }
}

export function offShipmentUpdated(callback: ShipmentUpdatedCallback): void {
  if (socket) {
    socket.off('shipment:updated', callback);
  }
  pendingListeners.delete(callback);
}

import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

export interface OrderCancelledPayload {
  orderId: string;
  status: 'CANCELLED';
  message: string;
}

type OrderCancelledCallback = (data: OrderCancelledPayload) => void;

let socket: Socket | null = null;
const pendingListeners = new Set<OrderCancelledCallback>();

export function connectOrderSocket(): Socket {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000', {
    withCredentials: true,
  });

  for (const cb of pendingListeners) {
    socket.on('order:cancelled', cb);
  }
  pendingListeners.clear();

  return socket;
}

export function disconnectOrderSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function onOrderCancelled(callback: OrderCancelledCallback): void {
  if (socket) {
    socket.on('order:cancelled', callback);
  } else {
    pendingListeners.add(callback);
  }
}

export function offOrderCancelled(callback: OrderCancelledCallback): void {
  if (socket) {
    socket.off('order:cancelled', callback);
  }
  pendingListeners.delete(callback);
}

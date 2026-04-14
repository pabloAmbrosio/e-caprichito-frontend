import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

export interface PaymentProofNotification {
  paymentId: string;
  orderId: string;
  customerId: string;
  amount: number; // centavos
}

export interface OrderCreatedNotification {
  orderId: string;
  customerUsername: string;
  itemCount: number;
  total: number; // centavos
}

type ProofUploadedCallback = (data: PaymentProofNotification) => void;
type OrderCreatedCallback = (data: OrderCreatedNotification) => void;

let socket: Socket | null = null;

// Listeners registered before the socket was connected.
// connectStaffSocket replays them once the socket exists.
const pendingProofListeners = new Set<ProofUploadedCallback>();
const pendingOrderListeners = new Set<OrderCreatedCallback>();

export function connectStaffSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000', {
    auth: { token },
  });

  // Replay any listeners queued before the socket existed
  for (const cb of pendingProofListeners) {
    socket.on('payment:proof-uploaded', cb);
  }
  pendingProofListeners.clear();

  for (const cb of pendingOrderListeners) {
    socket.on('order:created', cb);
  }
  pendingOrderListeners.clear();

  return socket;
}

export function onPaymentProofUploaded(callback: ProofUploadedCallback): void {
  if (socket) {
    socket.on('payment:proof-uploaded', callback);
  } else {
    pendingProofListeners.add(callback);
  }
}

export function offPaymentProofUploaded(callback: ProofUploadedCallback): void {
  if (socket) {
    socket.off('payment:proof-uploaded', callback);
  }
  pendingProofListeners.delete(callback);
}

export function onOrderCreated(callback: OrderCreatedCallback): void {
  if (socket) {
    socket.on('order:created', callback);
  } else {
    pendingOrderListeners.add(callback);
  }
}

export function offOrderCreated(callback: OrderCreatedCallback): void {
  if (socket) {
    socket.off('order:created', callback);
  }
  pendingOrderListeners.delete(callback);
}

export function disconnectStaffSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getStaffSocket(): Socket | null {
  return socket;
}

import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

type PaymentConfirmedCallback = (orderId: string) => void;

let socket: Socket | null = null;

export function connectPaymentSocket(onPaymentConfirmed: PaymentConfirmedCallback): void {
  socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000', {
    withCredentials: true,
  });

  // Backend emits 'pago:confirmado' when a payment is approved
  socket.on('pago:confirmado', (orderId: string) => {
    onPaymentConfirmed(orderId);
  });
}

export function disconnectPaymentSocket(): void {
  socket?.disconnect();
  socket = null;
}

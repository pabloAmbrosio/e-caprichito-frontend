import type { PaymentInfoLastPayment } from '../../domain/types';

interface PaymentStatusBannerProps {
  lastPayment: PaymentInfoLastPayment | null;
}

export function PaymentStatusBanner({ lastPayment }: PaymentStatusBannerProps) {
  if (!lastPayment) return null;

  if (lastPayment.status === 'AWAITING_REVIEW') {
    return (
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-turquoise/5 dark:bg-turquoise/10 border border-turquoise/20 dark:border-turquoise/30">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-turquoise shrink-0 mt-0.5" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-extrabold text-turquoise">Comprobante recibido</p>
          <p className="text-xs font-medium text-on-surface-muted mt-0.5">
            Estamos revisando tu comprobante de pago. Te notificaremos cuando sea aprobado.
          </p>
        </div>
      </div>
    );
  }

  if (lastPayment.status === 'REJECTED') {
    return (
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-pink shrink-0 mt-0.5" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-extrabold text-pink">Comprobante rechazado</p>
          <p className="text-xs font-medium text-on-surface-muted mt-0.5">
            Tu comprobante anterior fue rechazado. Por favor, sube un nuevo comprobante.
          </p>
        </div>
      </div>
    );
  }

  if (lastPayment.status === 'EXPIRED') {
    return (
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-surface-overlay border border-stroke">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-on-surface-muted shrink-0 mt-0.5" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-extrabold text-on-surface">Pago expirado</p>
          <p className="text-xs font-medium text-on-surface-muted mt-0.5">
            El tiempo para realizar el pago ha expirado.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

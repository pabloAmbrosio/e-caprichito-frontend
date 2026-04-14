import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePaymentInfo } from '../../hooks/usePaymentInfo';
import { useMyPayments } from '@/features/payments/hooks/useMyPayments';
import { useUploadProof } from '@/features/payments/hooks/useUploadProof';
import { ProofUploadZone } from '@/features/payments/components/ProofUploadZone';
import {
  connectPaymentSocket,
  disconnectPaymentSocket,
} from '@/features/payments/infrastructure/paymentSocket';
import { CountdownTimer } from './CountdownTimer';
import { BankDetailsCard } from './BankDetailsCard';
import { PaymentStatusBanner } from './PaymentStatusBanner';
import type { DeliveryType } from '@/shared/types/enums';

function formatPrice(valueInCents: number): string {
  return (valueInCents / 100).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  });
}

const DELIVERY_LABELS: Record<DeliveryType, string> = {
  PICKUP: 'Recoger en tienda',
  HOME_DELIVERY: 'Envío a domicilio',
  SHIPPING: 'Envío por paquetería',
};

interface PaymentPageProps {
  orderId: string;
}

export function PaymentPage({ orderId }: PaymentPageProps) {
  const router = useRouter();
  const { paymentInfo, isLoading, error, refetch } = usePaymentInfo(orderId);
  const {
    payment,
    isLoading: paymentLoading,
    createPayment,
    uploadProof,
  } = useMyPayments(orderId);

  const uploadProofState = useUploadProof();

  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankReference, setBankReference] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Listen for payment confirmation via WebSocket
  useEffect(() => {
    connectPaymentSocket((confirmedOrderId) => {
      if (confirmedOrderId === orderId) {
        void router.push(`/account/orders/${orderId}`);
      }
    });
    return () => disconnectPaymentSocket();
  }, [orderId, router]);

  // Redirect if payment already approved or COD order
  useEffect(() => {
    if (paymentInfo?.lastPayment?.status === 'APPROVED' || paymentInfo?.lastPayment?.method === 'CASH_ON_DELIVERY') {
      void router.push(`/account/orders/${orderId}`);
    }
  }, [paymentInfo, orderId, router]);

  // Auto-create payment if none exists and info is loaded
  useEffect(() => {
    if (
      !isLoading &&
      !paymentLoading &&
      paymentInfo &&
      !payment &&
      !isCreatingPayment &&
      paymentInfo.status === 'PENDING' &&
      paymentInfo.lastPayment?.method !== 'CASH_ON_DELIVERY'
    ) {
      setIsCreatingPayment(true);
      void createPayment()
        .catch(() => {
          // Payment may already exist, refetch
        })
        .finally(() => setIsCreatingPayment(false));
    }
  }, [isLoading, paymentLoading, paymentInfo, payment, isCreatingPayment, createPayment]);

  const handleSubmitProof = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const secureUrl = await uploadProofState.upload();
      await uploadProof({
        screenshotUrl: secureUrl,
        bankReference: bankReference.trim() || undefined,
      });
      // Refetch paymentInfo so lastPayment.status updates to AWAITING_REVIEW
      await refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al subir comprobante');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col gap-5">
          <div className="h-8 w-48 rounded-xl animate-pulse bg-surface-overlay" />
          <div className="h-20 rounded-2xl animate-pulse bg-surface-overlay" />
          <div className="h-64 rounded-2xl animate-pulse bg-surface-overlay" />
          <div className="h-48 rounded-2xl animate-pulse bg-surface-overlay" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !paymentInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(240,23,122,0.08), rgba(255,122,0,0.08))' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-9 h-9 text-pink/50" aria-hidden="true">
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-lg font-extrabold text-on-surface mb-1.5">
            {error ?? 'Pedido no encontrado'}
          </h2>
          <p className="text-sm text-on-surface-muted font-medium mb-6">
            No pudimos cargar la información de este pedido
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full text-sm font-extrabold text-white no-underline transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_1rem_rgba(0,197,212,0.35)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
            style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // Cancelled or expired order
  if (paymentInfo.status === 'CANCELLED') {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(240,23,122,0.08), rgba(255,122,0,0.08))' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-9 h-9 text-on-surface-muted/30" aria-hidden="true">
              <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-lg font-extrabold text-on-surface mb-1.5">
            Pedido cancelado
          </h2>
          <p className="text-sm text-on-surface-muted font-medium mb-6">
            Este pedido ha sido cancelado
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full text-sm font-extrabold text-white no-underline transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_1rem_rgba(0,197,212,0.35)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
            style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
          >
            Explorar productos
          </Link>
        </div>
      </div>
    );
  }

  

  const isAwaitingReview =
    payment?.status === 'AWAITING_REVIEW' ||
    paymentInfo.lastPayment?.status === 'AWAITING_REVIEW';

  const canUploadProof =
    !isAwaitingReview &&
    payment &&
    (payment.status === 'PENDING' || payment.status === 'REJECTED') &&
    paymentInfo.status === 'PENDING';

  const isExpired =
    paymentInfo.expiresAt && new Date(paymentInfo.expiresAt).getTime() < Date.now();

  // ── Awaiting review: dedicated view ──
  if (isAwaitingReview) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {/* Turquoise check icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(0,197,212,0.1), rgba(0,155,171,0.1))' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-turquoise" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-xl font-extrabold text-on-surface mb-2">
            Comprobante enviado
          </h1>
          <p className="text-sm text-on-surface-muted font-medium mb-2 max-w-sm">
            Tu comprobante de pago fue recibido correctamente. Nuestro equipo lo revisará y te notificaremos cuando sea aprobado.
          </p>
          <p className="text-xs text-on-surface-muted/60 font-medium mb-8">
            Este proceso puede tardar unos minutos
          </p>

          {/* Order summary compact */}
          <div className="w-full max-w-sm bg-surface rounded-2xl border border-stroke overflow-hidden mb-6">
            <div
              aria-hidden="true"
              className="h-[0.1875rem]"
              style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
            />
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface-muted">Pedido</span>
                <span className="font-mono font-bold text-on-surface text-xs">
                  {orderId.slice(0, 8)}…
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface-muted">Total</span>
                <span className="font-extrabold text-on-surface tabular-nums">
                  {formatPrice(paymentInfo.total)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface-muted">Estado</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-turquoise">
                  <span className="w-1.5 h-1.5 rounded-full bg-turquoise animate-pulse" />
                  En revisión
                </span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <Link
              href={`/account/orders/${orderId}`}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-extrabold text-white no-underline transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_1rem_rgba(0,197,212,0.35)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
              style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
            >
              Ver mi pedido
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/"
              className="w-full flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-on-surface-muted no-underline border border-stroke transition-all duration-200 hover:border-turquoise/30 hover:text-turquoise focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-on-surface">Completa tu pago</h1>
        <Link
          href={`/account/orders/${orderId}`}
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-muted font-bold hover:text-turquoise transition-colors duration-200 no-underline outline-none focus-visible:text-turquoise"
        >
          Ver pedido
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        {/* Countdown timer */}
        <CountdownTimer expiresAt={paymentInfo.expiresAt} />

        {/* Payment status banner */}
        <PaymentStatusBanner lastPayment={paymentInfo.lastPayment} />

        {/* Order summary */}
        <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
          <div
            aria-hidden="true"
            className="h-[0.1875rem]"
            style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
          />
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-1 h-4 rounded-full"
                style={{ background: 'linear-gradient(180deg, #00C5D4, #009BAB)' }}
                aria-hidden="true"
              />
              <h3 className="text-sm font-extrabold text-on-surface">Resumen del pedido</h3>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-on-surface-muted">Tipo de entrega</span>
              <span className="font-bold text-on-surface">
                {DELIVERY_LABELS[paymentInfo.deliveryType]}
              </span>
            </div>

            <div aria-hidden="true" className="h-px bg-stroke" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface-muted">Subtotal</span>
                <span className="text-sm font-bold text-on-surface tabular-nums">
                  {formatPrice(paymentInfo.subtotal)}
                </span>
              </div>

              {paymentInfo.totalDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Descuento
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    &minus;{formatPrice(paymentInfo.totalDiscount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface-muted">Envío</span>
                {paymentInfo.deliveryFee === 0 ? (
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    GRATIS
                  </span>
                ) : (
                  <span className="text-sm font-bold text-on-surface tabular-nums">
                    +{formatPrice(paymentInfo.deliveryFee)}
                  </span>
                )}
              </div>

              <div aria-hidden="true" className="h-px bg-stroke my-1" />

              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-on-surface">Total a pagar</span>
                <span className="text-lg font-black text-on-surface tabular-nums">
                  {formatPrice(paymentInfo.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bank details — only when still needs to upload proof */}
        {!isExpired && canUploadProof && paymentInfo.status === 'PENDING' && (
          <BankDetailsCard
            bankDetails={paymentInfo.bankDetails}
            concepto={paymentInfo.concepto}
            total={paymentInfo.total}
          />
        )}

        {/* Upload proof section */}
        {canUploadProof && !isExpired && (
          <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #F0177A, #C0005A)' }}
                  aria-hidden="true"
                />
                <h3 className="text-sm font-extrabold text-on-surface">Subir comprobante</h3>
              </div>

              <p className="text-xs text-on-surface-muted font-medium">
                Sube una captura de pantalla o foto de tu comprobante de pago
              </p>

              <ProofUploadZone
                file={uploadProofState.file}
                previewUrl={uploadProofState.previewUrl}
                isUploading={uploadProofState.isUploading}
                error={uploadProofState.error ?? submitError}
                onSelectFile={uploadProofState.selectFile}
                onClearFile={uploadProofState.clearFile}
                bankReference={bankReference}
                onBankReferenceChange={setBankReference}
                onSubmit={() => void handleSubmitProof()}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Back to store */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-bold text-on-surface-muted hover:text-turquoise transition-colors duration-200 no-underline outline-none focus-visible:text-turquoise"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}

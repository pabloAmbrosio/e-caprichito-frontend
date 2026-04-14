import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { AccountLayout } from '@/shared/layouts/AccountLayout';
import { ProtectedRoute } from '@/features/auth';
import {
  useOrderDetail,
  useShipmentUpdated,
  useOrderCancelled,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR_CLASS,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_COLOR,
  SHIPMENT_STEPS,
  SHIPMENT_CHAINS,
} from '@/features/orders';
import { useMyPayments, useUploadProof, ProofUploadZone } from '@/features/payments';

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({
  onConfirm,
  onClose,
  loading,
}: {
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div
        className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-surface rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-6 sm:p-7 w-full max-w-sm border border-stroke overflow-hidden">
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[0.1875rem]"
          style={{ background: 'linear-gradient(90deg, #F0177A, #C0005A)' }}
          aria-hidden="true"
        />
        <div className="flex items-start gap-3 mb-4">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(240,23,122,0.12), rgba(240,23,122,0.04))' }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-pink">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <h2
              id="cancel-modal-title"
              className="text-lg font-extrabold text-on-surface"
            >
              Cancelar pedido?
            </h2>
            <p className="text-sm text-on-surface-muted mt-1">
              Esta accion no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-stroke text-sm font-bold text-on-surface hover:bg-surface-overlay transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
          >
            No, mantener
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink disabled:opacity-60 hover:scale-[1.02] hover:shadow-[0_0.25rem_0.75rem_rgba(240,23,122,0.3)]"
            style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
          >
            {loading ? 'Cancelando...' : 'Si, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface rounded-2xl border border-stroke overflow-hidden">
      <div className="px-5 py-4 border-b border-stroke flex items-center gap-2">
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: 'linear-gradient(180deg, #00C5D4, #009BAB)' }}
          aria-hidden="true"
        />
        <h2 className="text-sm font-extrabold text-on-surface">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const router = useRouter();
  const orderId = typeof router.query['id'] === 'string' ? router.query['id'] : '';

  const { order, isLoading, error, cancelOrder, refresh, updateShipmentStatus } = useOrderDetail(orderId);
  const {
    payment,
    isLoading: paymentLoading,
    createPayment,
    uploadProof,
  } = useMyPayments(orderId);

  useShipmentUpdated(orderId, (data) => {
    updateShipmentStatus(data.status);
    void refresh();
  });

  useOrderCancelled(orderId, () => {
    void refresh();
  });

  const [showItems, setShowItems] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const uploadProofState = useUploadProof();

  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadSubmitError, setUploadSubmitError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [bankReference, setBankReference] = useState('');

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelError(null);
    try {
      await cancelOrder();
      setShowCancelModal(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Error al cancelar el pedido');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    try {
      await createPayment();
    } catch (err) {
      setUploadSubmitError(err instanceof Error ? err.message : 'Error al crear el pago');
    }
  };

  const handleSubmitProof = async () => {
    setUploadSubmitting(true);
    setUploadSubmitError(null);
    try {
      const secureUrl = await uploadProofState.upload();
      await uploadProof({
        screenshotUrl: secureUrl,
        bankReference: bankReference.trim() || undefined,
      });
      setUploadSuccess(true);
    } catch (err) {
      setUploadSubmitError(err instanceof Error ? err.message : 'Error al subir el comprobante');
    } finally {
      setUploadSubmitting(false);
    }
  };


  // Use backend-provided totals (all in centavos)
  const subtotal = order?.subtotal ?? 0;
  const totalDiscount = order?.totalDiscount ?? 0;
  const orderDeliveryFee = order?.deliveryFee ?? 0;
  const total = order?.total ?? 0;

  return (
    <ProtectedRoute>
      <AccountLayout title="Detalle de Pedido">
        {/* Back link */}
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-muted font-bold hover:text-turquoise transition-colors duration-200 mb-5"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          Mis pedidos
        </Link>

        {isLoading && (
          <div className="flex flex-col gap-4">
            {[...Array<undefined>(3)].map((_, i) => (
              <div key={i} className="bg-surface border border-stroke rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-24 h-3 rounded-full bg-surface-overlay" />
                  <div className="w-20 h-5 rounded-full bg-surface-overlay" />
                </div>
                <div className="w-48 h-3 rounded-full bg-surface-overlay" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30 text-pink text-sm font-semibold mb-4">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {cancelError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30 text-pink text-sm font-semibold mb-4">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {cancelError}
          </div>
        )}

        {order && (
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface rounded-2xl border border-stroke p-5 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-[0.1875rem]"
                style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-mono text-on-surface-muted mb-1">
                  Pedido #{order.id.slice(0, 8)}...
                </p>
                <p className="text-xs text-on-surface-muted">
                  {new Date(order.createdAt).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span
                className={`self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-bold ${ORDER_STATUS_COLOR_CLASS[order.status]}`}
              >
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>

            {/* Seccion de pago */}
            <Section title="Pago">
              {paymentLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-turquoise/20 border-t-turquoise animate-spin" aria-hidden="true" />
                  <p className="text-sm text-on-surface-muted">Cargando informacion de pago...</p>
                </div>
              ) : (
                (() => {
                  const isCod = order.payments.some((p) => p.method === 'CASH_ON_DELIVERY');
                  return (
                    <>
                      {/* Resumen de pagos embebidos en la orden */}
                      {order.payments.length > 0 && (
                        <div className="mb-4 flex flex-col gap-2">
                          {order.payments.map((p, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm py-2.5 px-3 rounded-xl bg-surface-overlay"
                            >
                              <span className="text-on-surface-muted font-semibold">
                                {p.method === 'MANUAL_TRANSFER'
                                  ? 'Transferencia manual'
                                  : p.method === 'CASH_ON_DELIVERY'
                                    ? 'Pago al recibir'
                                    : p.method}
                              </span>
                              <span className={`font-bold ${PAYMENT_STATUS_COLOR[p.status]}`}>
                                {PAYMENT_STATUS_LABEL[p.status]}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* COD payment info */}
                      {order.payments.some((p) => p.method === 'CASH_ON_DELIVERY' && p.status === 'PENDING') && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-turquoise/5 dark:bg-turquoise/8 border border-turquoise/20">
                          <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">💵</span>
                          <div>
                            <p className="text-sm font-bold text-turquoise">
                              Pagarás al recibir tu pedido
                            </p>
                            <p className="text-xs text-on-surface-muted mt-1">
                              Nuestro repartidor cobrará el monto total cuando te entregue la mercancía. No necesitas hacer nada más por ahora.
                            </p>
                          </div>
                        </div>
                      )}

                      {order.payments.some((p) => p.method === 'CASH_ON_DELIVERY' && p.status === 'APPROVED') && (
                        <div className="flex items-center gap-3 text-sm font-bold text-green-600 dark:text-green-400 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                          <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                          </svg>
                          Pago recibido. ¡Gracias por tu compra!
                        </div>
                      )}

                      {order.payments.some((p) => p.method === 'CASH_ON_DELIVERY' && p.status === 'CANCELLED') && (
                        <div className="flex items-center gap-3 text-sm font-bold p-4 rounded-xl bg-surface-overlay border border-stroke">
                          <span className="text-lg shrink-0" aria-hidden="true">💵</span>
                          <span className="text-on-surface-muted">
                            El pago al recibir fue cancelado.
                          </span>
                        </div>
                      )}

                      {/* Transfer payment actions (hidden for COD) */}
                      {!isCod && (
                        <>
                          {order.status === 'PENDING' && !payment && (
                            <div className="flex flex-col gap-3">
                              <p className="text-sm text-on-surface-muted">
                                Para confirmar tu pedido, realiza una transferencia bancaria y sube el
                                comprobante.
                              </p>
                              <button
                                onClick={() => void handleCreatePayment()}
                                className="self-start px-5 py-2.5 rounded-xl text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 hover:scale-[1.02] hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.35)] transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                              >
                                Iniciar pago
                              </button>
                            </div>
                          )}

                          {payment?.status === 'PENDING' && !uploadSuccess && (
                            <div className="flex flex-col gap-3">
                              <p className="text-sm text-on-surface-muted">
                                Pago creado. Ahora sube el comprobante de transferencia.
                              </p>
                              <ProofUploadZone
                                file={uploadProofState.file}
                                previewUrl={uploadProofState.previewUrl}
                                isUploading={uploadProofState.isUploading}
                                error={uploadProofState.error ?? uploadSubmitError}
                                onSelectFile={uploadProofState.selectFile}
                                onClearFile={uploadProofState.clearFile}
                                bankReference={bankReference}
                                onBankReferenceChange={setBankReference}
                                onSubmit={() => void handleSubmitProof()}
                                isSubmitting={uploadSubmitting}
                              />
                            </div>
                          )}

                          {(payment?.status === 'AWAITING_REVIEW' || uploadSuccess) && (
                            <div className="flex items-center gap-3 text-sm font-bold p-4 rounded-xl bg-orange/5 dark:bg-orange/8 border border-orange/20">
                              <div className="w-4 h-4 rounded-full border-2 border-orange/30 border-t-orange animate-spin shrink-0" aria-hidden="true" />
                              <span className="text-orange">Comprobante enviado. Estamos revisando tu pago.</span>
                            </div>
                          )}

                          {payment?.status === 'APPROVED' && (
                            <div className="flex items-center gap-3 text-sm font-bold text-green-600 dark:text-green-400 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                              <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                              </svg>
                              Pago aprobado. ¡Gracias por tu compra!
                            </div>
                          )}

                          {payment?.status === 'REJECTED' && (
                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30">
                              <p className="flex items-center gap-2 text-sm font-bold text-pink">
                                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                                  <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm2.78-4.22a.75.75 0 01-1.06 0L8 9.06l-1.72 1.72a.75.75 0 11-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 011.06-1.06L8 6.94l1.72-1.72a.75.75 0 111.06 1.06L9.06 8l1.72 1.72a.75.75 0 010 1.06z" clipRule="evenodd" />
                                </svg>
                                Tu comprobante fue rechazado.
                              </p>
                              <p className="text-xs text-on-surface-muted pl-6">
                                Puedes volver a intentarlo iniciando un nuevo pago.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  );
                })()
              )}
            </Section>

            {/* Link to payment page */}
            {order.status === 'PENDING' && (
              <Link
                href={`/payment/${order.id}`}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-extrabold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0.25rem_1rem_rgba(0,197,212,0.4)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none no-underline"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
              >
                Ir a pagar
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </Link>
            )}

            {/* Boton cancelar (solo si PENDING) */}
            {order.status === 'PENDING' && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-pink border border-pink/30 hover:bg-pink/5 dark:hover:bg-pink/10 hover:border-pink/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2"
                >
                  Cancelar pedido
                </button>
              </div>
            )}

            {/* Timeline de entrega */}
            {order.shipment && order.shipment.status !== 'FAILED' && (
              <Section title="Estado de entrega">
                {(() => {
                  const chain = SHIPMENT_CHAINS[order.shipment!.type];
                  const stepsForType = SHIPMENT_STEPS.filter((s) => chain.includes(s.status));
                  const currentIdx = chain.indexOf(order.shipment!.status);
                  return (
                    <ol className="flex items-start gap-0" role="list">
                      {stepsForType.map((step, idx) => {
                        const isCompleted = idx <= currentIdx;
                        const isActive = idx === currentIdx;
                        return (
                          <li key={step.status} className="flex-1 flex flex-col items-center relative">
                            {idx < stepsForType.length - 1 && (
                              <div
                                className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors duration-500 ${isCompleted ? 'bg-turquoise' : 'bg-stroke'}`}
                                aria-hidden="true"
                              />
                            )}
                            <div
                              className={[
                                'relative z-10 flex items-center justify-center w-9 h-9 rounded-full text-sm border-2 transition-all duration-300',
                                isCompleted
                                  ? 'border-turquoise text-white'
                                  : 'bg-surface border-stroke text-on-surface-muted',
                                isActive ? 'ring-4 ring-turquoise/20 scale-110' : '',
                              ].join(' ')}
                              style={isCompleted ? { background: 'linear-gradient(135deg, #00C5D4, #009BAB)' } : undefined}
                              aria-current={isActive ? 'step' : undefined}
                            >
                              {isCompleted ? (
                                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span aria-hidden="true">{step.emoji}</span>
                              )}
                            </div>
                            <p
                              className={`mt-2.5 text-xs font-bold text-center ${isActive ? 'text-turquoise' : isCompleted ? 'text-on-surface' : 'text-on-surface-muted'}`}
                            >
                              {step.label}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                  );
                })()}

                {/* Carrier + tracking info */}
                {order.shipment.carrier && (
                  <div className="mt-4 pt-3 border-t border-stroke flex items-center gap-2 text-sm">
                    <span className="text-on-surface-muted font-semibold">Paqueteria:</span>
                    <span className="font-bold text-on-surface">{order.shipment.carrier}</span>
                    {order.shipment.trackingCode && (
                      <span className="font-mono text-xs text-turquoise bg-turquoise/10 px-2 py-0.5 rounded-full">
                        {order.shipment.trackingCode}
                      </span>
                    )}
                  </div>
                )}
              </Section>
            )}

            {/* Shipment failed */}
            {order.shipment?.status === 'FAILED' && (
              <Section title="Estado de entrega">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-pink shrink-0" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-pink">El envio fue cancelado.</span>
                </div>
              </Section>
            )}

            {/* Address snapshot */}
            {order.addressSnapshot && (
              <Section title="Direccion de envio">
                <div className="flex items-start gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-turquoise shrink-0 mt-0.5" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{order.addressSnapshot.label}</p>
                    <p className="text-xs text-on-surface-muted mt-0.5">{order.addressSnapshot.formattedAddress}</p>
                    {order.addressSnapshot.details && (
                      <p className="text-xs text-on-surface-muted mt-0.5">{order.addressSnapshot.details}</p>
                    )}
                  </div>
                </div>
              </Section>
            )}

            {/* Articulos */}
            <Section title={`Articulos (${order.items.length})`}>
              {/* Collapsible toggle */}
              <button
                type="button"
                onClick={() => setShowItems((prev) => !prev)}
                className="flex items-center justify-between w-full group outline-none focus-visible:ring-2 focus-visible:ring-turquoise rounded-lg -mx-1 px-1 mb-1"
                aria-expanded={showItems}
              >
                <span className="text-xs font-bold text-on-surface-muted">
                  {showItems ? 'Ocultar artículos' : 'Ver artículos'}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 text-on-surface-muted transition-transform duration-200 ${showItems ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Collapsed preview: thumbnails */}
              <div
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ gridTemplateRows: showItems ? '0fr' : '1fr', opacity: showItems ? 0 : 1 }}
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 mt-1">
                    {order.items.slice(0, 5).map((item) => {
                      const img = item.product.images?.[0];
                      const thumbUrl = img?.thumbnailUrl ?? img?.imageUrl;
                      return (
                        <div key={item.id} className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface-overlay ring-1 ring-stroke shrink-0">
                          {thumbUrl ? (
                            <Image src={thumbUrl} alt="" fill unoptimized className="object-cover" sizes="2.5rem" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-muted/20">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4" aria-hidden="true">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              </svg>
                            </div>
                          )}
                          <span className="absolute top-0 left-0 min-w-[0.875rem] h-3.5 px-0.5 flex items-center justify-center text-[0.5rem] font-black text-white rounded-br-md bg-on-surface/70">
                            {item.quantity}
                          </span>
                        </div>
                      );
                    })}
                    {order.items.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setShowItems(true)}
                        className="text-[0.625rem] font-bold text-on-surface-muted ml-1 hover:text-turquoise transition-colors duration-150"
                      >
                        +{order.items.length - 5} más
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded items list */}
              <div
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ gridTemplateRows: showItems ? '1fr' : '0fr', opacity: showItems ? 1 : 0 }}
              >
                <div className="overflow-hidden">
                  <ul className="flex flex-col divide-y divide-stroke mt-1" role="list">
                    {order.items.map((item) => {
                      const img = item.product.images?.[0];
                      const imageUrl = img?.thumbnailUrl ?? img?.imageUrl ?? '/images/products/placeholder.jpg';

                      return (
                        <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-overlay shrink-0 border border-stroke">
                            <Image
                              src={imageUrl}
                              alt={item.product.title}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="3.5rem"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-on-surface truncate">
                              {item.product.title}
                            </p>
                            <p className="text-xs text-on-surface-muted mt-0.5">
                              x{item.quantity} · ${(item.product.priceInCents / 100).toFixed(2)} c/u
                            </p>
                          </div>
                          <p className="text-sm font-extrabold text-on-surface shrink-0 tabular-nums">
                            ${((item.product.priceInCents * item.quantity) / 100).toFixed(2)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Totales */}
              <div className="mt-4 pt-4 border-t border-stroke flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-muted">Subtotal</span>
                  <span className="font-semibold text-on-surface tabular-nums">
                    ${(subtotal / 100).toFixed(2)}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">Descuento</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">-${(totalDiscount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-muted">Envio</span>
                  {orderDeliveryFee === 0 ? (
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      GRATIS
                    </span>
                  ) : (
                    <span className="font-bold text-on-surface tabular-nums">+${(orderDeliveryFee / 100).toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1 pt-2 border-t border-stroke">
                  <span className="text-base font-extrabold text-on-surface">Total</span>
                  <span className="text-lg font-extrabold text-on-surface tabular-nums">${(total / 100).toFixed(2)}</span>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* Modal de confirmacion de cancelacion */}
        {showCancelModal && (
          <CancelModal
            onConfirm={() => void handleCancel()}
            onClose={() => setShowCancelModal(false)}
            loading={cancelLoading}
          />
        )}
      </AccountLayout>
    </ProtectedRoute>
  );
}


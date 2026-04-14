import { useState } from 'react';
import type { AppliedPromotion, DrawerDisplayItem } from '@/features/cart';
import type { DeliveryType, PaymentMethod } from '@/shared/types/enums';

function formatPrice(value: number): string {
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  });
}

const DELIVERY_LABELS: Record<DeliveryType, { icon: string; label: string }> = {
  PICKUP: { icon: '🏪', label: 'Recoger en tienda' },
  HOME_DELIVERY: { icon: '🚚', label: 'Envío a domicilio' },
  SHIPPING: { icon: '📦', label: 'Envío por paquetería' },
};

interface StepConfirmProps {
  items: DrawerDisplayItem[];
  deliveryType: DeliveryType;
  deliveryFee: number;
  subtotal: number;
  totalDiscount: number;
  appliedPromotions: AppliedPromotion[];
  total: number;
  itemCount: number;
  isConfirming: boolean;
  confirmError: string | null;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function StepConfirm({
  items,
  deliveryType,
  deliveryFee,
  subtotal,
  totalDiscount,
  appliedPromotions,
  total,
  itemCount,
  isConfirming,
  confirmError,
  paymentMethod,
  onPaymentMethodChange,
  onBack,
  onConfirm,
}: StepConfirmProps) {
  const [showItems, setShowItems] = useState(false);
  const deliveryInfo = DELIVERY_LABELS[deliveryType];

  return (
    <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
      {/* Brand gradient stripe */}
      <div
        aria-hidden="true"
        className="h-[0.1875rem]"
        style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
      />

      <div className="p-5 flex flex-col gap-5">
        {/* Delivery summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-1 h-4 rounded-full"
                style={{ background: 'linear-gradient(180deg, #00C5D4, #009BAB)' }}
                aria-hidden="true"
              />
              <h3 className="text-sm font-extrabold text-on-surface">Entrega</h3>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-turquoise hover:text-turquoise-dark transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-turquoise rounded"
            >
              Cambiar
            </button>
          </div>

          <div className="ml-3 flex items-start gap-2.5 text-sm text-on-surface-muted font-medium">
            <span className="text-base" aria-hidden="true">{deliveryInfo.icon}</span>
            <p className="font-bold text-on-surface">{deliveryInfo.label}</p>
          </div>
        </div>

        <div aria-hidden="true" className="h-px bg-stroke" />

        {/* Items list — collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setShowItems((prev) => !prev)}
            className="flex items-center justify-between w-full group outline-none focus-visible:ring-2 focus-visible:ring-turquoise rounded-lg -mx-1 px-1"
            aria-expanded={showItems}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-1 h-4 rounded-full"
                style={{ background: 'linear-gradient(180deg, #00C5D4, #009BAB)' }}
                aria-hidden="true"
              />
              <h3 className="text-sm font-extrabold text-on-surface">
                Artículos ({itemCount})
              </h3>
            </div>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-4 h-4 text-on-surface-muted transition-transform duration-200 ${showItems ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Collapsed preview: thumbnails strip */}
          {items.length > 0 && (
            <div
              className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: showItems ? '0fr' : '1fr', opacity: showItems ? 0 : 1 }}
            >
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5 mt-2 ml-3">
                  {items.slice(0, 4).map((item) => (
                    <div key={item.productId} className="relative w-9 h-9 rounded-lg overflow-hidden bg-surface-overlay ring-1 ring-stroke shrink-0">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-muted/20">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5" aria-hidden="true">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-0 left-0 min-w-[0.875rem] h-3.5 px-0.5 flex items-center justify-center text-[0.5rem] font-black text-white rounded-br-md bg-on-surface/70">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowItems(true)}
                      className="text-[0.625rem] font-bold text-on-surface-muted ml-1 hover:text-turquoise transition-colors duration-150"
                    >
                      +{items.length - 4} más
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Expanded items list */}
          <div
            className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ gridTemplateRows: showItems ? '1fr' : '0fr', opacity: showItems ? 1 : 0 }}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col divide-y divide-stroke mt-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-overlay shrink-0 ring-1 ring-stroke">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-muted/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" aria-hidden="true">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface line-clamp-1">{item.title}</p>
                      <span className="text-xs text-on-surface-muted font-medium">
                        {item.quantity} &times; {formatPrice(item.unitPrice)}
                      </span>
                    </div>

                    <span className="text-sm font-extrabold text-on-surface tabular-nums shrink-0">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="h-px bg-stroke" />

        {/* Payment method */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-1 h-4 rounded-full"
              style={{ background: 'linear-gradient(180deg, #00C5D4, #009BAB)' }}
              aria-hidden="true"
            />
            <h3 className="text-sm font-extrabold text-on-surface">Metodo de pago</h3>
          </div>

          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Metodo de pago">
            <button
              type="button"
              role="radio"
              aria-checked={paymentMethod === 'MANUAL_TRANSFER'}
              onClick={() => onPaymentMethodChange('MANUAL_TRANSFER')}
              className={[
                'flex items-start gap-3 w-full text-left p-3.5 rounded-xl border transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2',
                paymentMethod === 'MANUAL_TRANSFER'
                  ? 'border-turquoise bg-turquoise/5'
                  : 'border-stroke bg-surface hover:border-turquoise/30',
              ].join(' ')}
            >
              <span
                className={[
                  'mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
                  paymentMethod === 'MANUAL_TRANSFER' ? 'border-turquoise' : 'border-stroke',
                ].join(' ')}
              >
                {paymentMethod === 'MANUAL_TRANSFER' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-turquoise" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">🏦</span>
                  <span className="text-sm font-bold text-on-surface">Transferencia o depósito</span>
                </span>
                <p className="text-xs text-on-surface-muted mt-0.5">
                  Transferencia bancaria, depósito en OXXO u otro punto — sube el comprobante
                </p>
              </div>
            </button>

            {deliveryType === 'HOME_DELIVERY' && (
              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === 'CASH_ON_DELIVERY'}
                onClick={() => onPaymentMethodChange('CASH_ON_DELIVERY')}
                className={[
                  'flex items-start gap-3 w-full text-left p-3.5 rounded-xl border transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2',
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-turquoise bg-turquoise/5'
                    : 'border-stroke bg-surface hover:border-turquoise/30',
                ].join(' ')}
              >
                <span
                  className={[
                    'mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
                    paymentMethod === 'CASH_ON_DELIVERY' ? 'border-turquoise' : 'border-stroke',
                  ].join(' ')}
                >
                  {paymentMethod === 'CASH_ON_DELIVERY' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-turquoise" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true">💵</span>
                    <span className="text-sm font-bold text-on-surface">Pago al recibir</span>
                  </span>
                  <p className="text-xs text-on-surface-muted mt-0.5">
                    Paga en efectivo al recibir tu pedido
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        <div aria-hidden="true" className="h-px bg-stroke" />

        {/* Totals */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-on-surface-muted">Subtotal</span>
            <span className="text-sm font-bold text-on-surface tabular-nums">
              {formatPrice(subtotal)}
            </span>
          </div>

          {totalDiscount > 0 && appliedPromotions.map((promo) => (
            <div key={promo.promotionId}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Descuento
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  &minus;{formatPrice(promo.discountAmountInCents / 100)}
                </span>
              </div>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium mt-0.5">
                {promo.promotionName}
              </p>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-on-surface-muted">Envío</span>
            {deliveryFee === 0 ? (
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                GRATIS
              </span>
            ) : (
              <span className="text-sm font-bold text-on-surface tabular-nums">
                +{formatPrice(deliveryFee)}
              </span>
            )}
          </div>

          <div aria-hidden="true" className="h-px bg-stroke my-1" />

          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold text-on-surface">Total</span>
            <span className="text-lg font-black text-on-surface tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Error */}
        {confirmError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-pink shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold text-pink">{confirmError}</span>
          </div>
        )}

        {/* Confirm CTA */}
        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirming}
          className="w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0.25rem_1rem_rgba(240,23,122,0.4)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
        >
          {isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
              Procesando...
            </span>
          ) : (
            'Confirmar pedido'
          )}
        </button>
      </div>
    </div>
  );
}

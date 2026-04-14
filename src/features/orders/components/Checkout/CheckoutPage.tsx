import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCartStore } from '@/features/cart';
import { getVariantId } from '@/features/cart';
import type { DrawerDisplayItem } from '@/features/cart';
import type { DeliveryType, PaymentMethod } from '@/shared/types/enums';
import { useAuthStore } from '@/features/auth';
import { useNotificationStore } from '@/shared/store/notificationStore';
import { createOrderApi } from '../../infrastructure/orderApi';
import { CheckoutProgress } from './CheckoutProgress';
import { StepDelivery } from './StepDelivery';
import { StepConfirm } from './StepConfirm';

const orderApi = createOrderApi();

const ORDER_SUCCESS_MESSAGES = [
  (name: string) => `¡Excelente, ${name}! Tu pedido está en camino. Ya estamos preparándolo con mucho cariño.`,
  (name: string) => `¡Gracias, ${name}! Recibimos tu pedido y nuestro equipo ya está trabajando en él.`,
  (name: string) => `¡Listo, ${name}! Tu pedido fue creado. Estamos alistándolo para que lo tengas lo antes posible.`,
  (name: string) => `¡Pedido confirmado, ${name}! Nos ponemos en marcha para que lo disfrutes pronto.`,
  (name: string) => `¡Genial, ${name}! Ya tenemos tu pedido. Estamos trabajando para entregártelo rapidísimo.`,
];

export function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);

  const [step, setStep] = useState<1 | 2>(1);
  const [isPickup, setIsPickup] = useState(false);
  const [resolvedDeliveryType, setResolvedDeliveryType] = useState<DeliveryType>('HOME_DELIVERY');
  const [addressId, setAddressId] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MANUAL_TRANSFER');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Normalize cart items (same pattern as CartPage)
  const items: DrawerDisplayItem[] = (cart?.items ?? []).map((item) => ({
    productId: getVariantId(item),
    title: item.product.title,
    image:
      item.product.images?.[0]?.thumbnailUrl ??
      item.product.images?.[0]?.imageUrl ??
      item.product.thumbnailUrl ??
      undefined,
    slug: item.product.abstractProduct?.slug ?? item.product.slug,
    quantity: item.quantity,
    unitPrice: item.product.priceInCents / 100,
    lineTotal: (item.product.priceInCents * item.quantity) / 100,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalDiscount = (cart?.totalDiscount ?? 0) / 100;
  const deliveryFeePesos = deliveryFee / 100;
  const total = subtotal - totalDiscount + deliveryFeePesos;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const username = useAuthStore((s) => s.user?.username);
  const pushNotification = useNotificationStore((s) => s.push);

  const canContinue = isPickup || addressId !== null;

  const handleAddressSelect = (id: string | null, fee: number, deliveryType: DeliveryType) => {
    setAddressId(id);
    setDeliveryFee(fee);
    setResolvedDeliveryType(deliveryType);
    if (deliveryType !== 'HOME_DELIVERY') {
      setPaymentMethod('MANUAL_TRANSFER');
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const result = await orderApi.create({
        addressId: !isPickup ? addressId ?? undefined : undefined,
        paymentMethod,
      });
      useCartStore.getState().clearCart();
      const name = username ?? 'amig@';
      const randomMsg = ORDER_SUCCESS_MESSAGES[Math.floor(Math.random() * ORDER_SUCCESS_MESSAGES.length)]!;
      pushNotification({
        type: 'success',
        message: randomMsg(name),
        href: `/account/orders/${result.orderId}`,
      });
      if (result.payment?.method === 'CASH_ON_DELIVERY') {
        void router.push(`/account/orders/${result.orderId}`);
      } else {
        void router.push(`/payment/${result.orderId}`);
      }
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error al crear el pedido');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-on-surface">Checkout</h1>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-muted font-bold hover:text-turquoise transition-colors duration-200 no-underline outline-none focus-visible:text-turquoise"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          Volver al carrito
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="w-9 h-9 rounded-full animate-pulse bg-surface-overlay" />
            <div className="w-24 h-1 rounded-full animate-pulse bg-surface-overlay" />
            <div className="w-9 h-9 rounded-full animate-pulse bg-surface-overlay" />
          </div>
          <div className="h-64 rounded-2xl animate-pulse bg-surface-overlay" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(0,197,212,0.08), rgba(240,23,122,0.08))' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-9 h-9 text-on-surface-muted/30" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="text-lg font-extrabold text-on-surface mb-1.5">
            Tu carrito está vacío
          </h2>
          <p className="text-sm text-on-surface-muted font-medium mb-6">
            Agrega productos antes de hacer checkout
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full text-sm font-extrabold text-white no-underline transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_1rem_rgba(0,197,212,0.35)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
            style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <>
          <CheckoutProgress currentStep={step} />

          {step === 1 ? (
            <StepDelivery
              isPickup={isPickup}
              onPickupChange={(pickup) => {
                setIsPickup(pickup);
                if (pickup) setPaymentMethod('MANUAL_TRANSFER');
              }}
              onAddressSelect={handleAddressSelect}
              canContinue={canContinue}
              onContinue={() => setStep(2)}
            />
          ) : (
            <StepConfirm
              items={items}
              deliveryType={isPickup ? 'PICKUP' : resolvedDeliveryType}
              deliveryFee={deliveryFeePesos}
              subtotal={subtotal}
              totalDiscount={totalDiscount}
              appliedPromotions={cart?.appliedPromotions ?? []}
              total={total}
              itemCount={itemCount}
              isConfirming={isConfirming}
              confirmError={confirmError}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onBack={() => setStep(1)}
              onConfirm={() => void handleConfirm()}
            />
          )}
        </>
      )}
    </div>
  );
}

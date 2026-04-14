import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCartStore } from '../../store/cartStore';
import { useGuestCartStore } from '../../store/guestCartStore';
import { useUpdateCartItem } from '../../hooks/useUpdateCartItem';
import { useRemoveCartItem } from '../../hooks/useRemoveCartItem';
import { useAuthStore, useAuthModalStore } from '@/features/auth';
import { isAuthDismissed, dismissAuthReminder } from '../../infrastructure/guestCartStorage';
import type { DrawerDisplayItem } from '../../domain/types';
import { getVariantId } from '../../domain/types';

function formatPrice(value: number): string {
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  });
}

// ─── Item Row ────────────────────────────────────────────────────────────────

interface CartPageItemProps {
  item: DrawerDisplayItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
  isExiting: boolean;
}

function CartPageItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  isRemoving,
  isExiting,
}: CartPageItemProps) {
  const handleDecrement = () => {
    if (item.quantity <= 1) {
      onRemove(item.productId);
    } else {
      onUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.productId, item.quantity + 1);
  };

  const thumbnail = (
    <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-overlay shrink-0 ring-1 ring-stroke">
      {item.image ? (
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-on-surface-muted/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" aria-hidden="true">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`flex gap-4 py-5 overflow-hidden ${
        isExiting
          ? 'pointer-events-none'
          : isRemoving
            ? 'opacity-40 pointer-events-none transition-opacity duration-200'
            : 'transition-opacity duration-200'
      }`}
      style={isExiting ? { animation: 'cartItemExit 0.4s ease forwards' } : undefined}
    >
      {/* Thumbnail — clickeable if slug exists */}
      {item.slug ? (
        <Link href={`/product/${item.slug}`} className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-turquoise rounded-xl">
          {thumbnail}
        </Link>
      ) : (
        thumbnail
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        {item.slug ? (
          <Link
            href={`/product/${item.slug}`}
            className="text-sm font-bold text-on-surface line-clamp-2 leading-snug hover:text-turquoise transition-colors duration-150 no-underline outline-none focus-visible:text-turquoise"
          >
            {item.title}
          </Link>
        ) : (
          <h4 className="text-sm font-bold text-on-surface line-clamp-2 leading-snug">
            {item.title}
          </h4>
        )}

        <span className="text-xs font-extrabold text-turquoise mt-1">
          {formatPrice(item.unitPrice)}
        </span>

        {/* Stepper */}
        <div className="flex items-center gap-0 mt-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isUpdating}
            aria-label={item.quantity <= 1 ? `Eliminar ${item.title}` : `Reducir cantidad de ${item.title}`}
            className="w-8 h-8 flex items-center justify-center rounded-l-lg border border-stroke text-on-surface-muted hover:text-on-surface hover:bg-surface-overlay transition-all duration-150 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1 outline-none"
          >
            {item.quantity <= 1 ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-pink" aria-hidden="true">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3" aria-hidden="true">
                <path d="M5 12h14" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <span
            className="w-10 h-8 flex items-center justify-center border-y border-stroke text-xs font-black text-on-surface tabular-nums"
            aria-label={`Cantidad: ${item.quantity}`}
          >
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isUpdating}
            aria-label={`Aumentar cantidad de ${item.title}`}
            className="w-8 h-8 flex items-center justify-center rounded-r-lg border border-stroke text-on-surface-muted hover:text-turquoise hover:bg-turquoise/10 transition-all duration-150 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1 outline-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3" aria-hidden="true">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Line total + remove */}
      <div className="flex flex-col items-end justify-between shrink-0">
        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          disabled={isRemoving}
          aria-label={`Eliminar ${item.title} del carrito`}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-muted/40 hover:text-pink hover:bg-pink/10 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-turquoise outline-none"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <span className="text-sm font-extrabold text-on-surface tabular-nums">
          {formatPrice(item.lineTotal)}
        </span>
      </div>
    </div>
  );
}

// ─── Cart Page ───────────────────────────────────────────────────────────────

export function CartPage() {
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthModalStore((s) => s.open);
  const guestItems = useGuestCartStore((s) => s.items);

  const { updateQuantity, updatingId } = useUpdateCartItem();
  const { removeItem, removingId } = useRemoveCartItem();

  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const exitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleRemoveWithAnimation = useCallback((productId: string) => {
    // Already exiting — ignore
    if (exitingIds.has(productId)) return;

    setExitingIds((prev) => new Set(prev).add(productId));

    const timer = setTimeout(() => {
      removeItem(productId);
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      exitTimers.current.delete(productId);
    }, 400);

    exitTimers.current.set(productId, timer);
  }, [exitingIds, removeItem]);

  const [isDismissed, setIsDismissed] = useState(() => isAuthDismissed());

  // Normalize items — same logic as CartDrawer
  const items: DrawerDisplayItem[] = isAuthenticated
    ? (cart?.items ?? []).map((item) => ({
        productId: getVariantId(item),
        title: item.product.title,
        image: item.product.images?.[0]?.thumbnailUrl ?? item.product.images?.[0]?.imageUrl ?? item.product.thumbnailUrl ?? undefined,
        slug: item.product.abstractProduct?.slug ?? item.product.slug,
        quantity: item.quantity,
        unitPrice: item.product.priceInCents / 100,
        lineTotal: (item.product.priceInCents * item.quantity) / 100,
      }))
    : guestItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.unitPrice * item.quantity,
      }));

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal derived from displayed items so it always stays in sync with quantity changes
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  // cart is only populated for auth users (cleared on logout), so no need for isAuthenticated guard
  const totalDiscount = (cart?.totalDiscount ?? 0) / 100;
  const total = subtotal - totalDiscount;

  const router = useRouter();

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    void router.push('/checkout');
  }, [isAuthenticated, openAuthModal, router]);

  const handleDismiss = useCallback(() => {
    dismissAuthReminder();
    setIsDismissed(true);
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-on-surface">Tu Carrito</h1>
          {itemCount > 0 && (
            <span
              className="text-[0.6875rem] font-black text-white min-w-[1.5rem] h-6 px-2 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
            >
              {itemCount}
            </span>
          )}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-muted font-bold hover:text-turquoise transition-colors duration-200 no-underline outline-none focus-visible:text-turquoise"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          Seguir comprando
        </Link>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col gap-0 divide-y divide-stroke">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 py-5 animate-pulse">
              <div className="w-20 h-20 rounded-xl bg-surface-overlay" />
              <div className="flex-1 flex flex-col gap-2.5 py-1">
                <div className="h-4 w-3/4 rounded bg-surface-overlay" />
                <div className="h-3 w-1/3 rounded bg-surface-overlay" />
                <div className="h-8 w-28 rounded-lg bg-surface-overlay mt-1" />
              </div>
              <div className="flex flex-col items-end justify-between py-1">
                <div className="w-6 h-6 rounded bg-surface-overlay" />
                <div className="h-4 w-16 rounded bg-surface-overlay" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(0,197,212,0.08), rgba(240,23,122,0.08))' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-on-surface-muted/30" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-on-surface mb-2">
            Tu carrito esta vacio
          </h2>
          <p className="text-sm text-on-surface-muted font-medium max-w-[18rem] leading-relaxed mb-8">
            Explora nuestros productos y encuentra algo especial para ti
          </p>
          <Link
            href="/"
            className="px-8 py-3 rounded-full text-sm font-extrabold text-white no-underline transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_1rem_rgba(0,197,212,0.35)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
            style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        /* Cart content — 2 columns */
        <div className="grid grid-cols-1 md:grid-cols-[1fr_22rem] lg:grid-cols-[1fr_24rem] gap-8 items-start">
          {/* Left — items list */}
          <div>
            {/* Auth reminder banner */}
            {!isAuthenticated && !isDismissed && (
              <div className="mb-5 p-4 rounded-xl border border-turquoise/20 bg-turquoise/5">
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-turquoise shrink-0 mt-0.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface leading-snug">
                      Inicia sesion para guardar tu carrito
                    </p>
                    <p className="text-xs text-on-surface-muted font-medium mt-1 leading-relaxed">
                      Tu carrito se sincronizara automaticamente al iniciar sesion.
                    </p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <button
                        type="button"
                        onClick={openAuthModal}
                        className="text-xs font-extrabold text-turquoise hover:text-turquoise-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-turquoise outline-none rounded"
                      >
                        Iniciar sesion
                      </button>
                      <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-xs font-semibold text-on-surface-muted/50 hover:text-on-surface-muted transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-turquoise outline-none rounded"
                      >
                        No recordarme mas
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
              <div className="px-5 py-4 border-b border-stroke flex items-center gap-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #00C5D4, #009BAB)' }}
                  aria-hidden="true"
                />
                <h2 className="text-sm font-extrabold text-on-surface">
                  Articulos ({items.length})
                </h2>
              </div>
              <div className="px-5 divide-y divide-stroke">
                {items.map((item) => (
                  <CartPageItem
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={handleRemoveWithAnimation}
                    isUpdating={updatingId === item.productId}
                    isRemoving={removingId === item.productId}
                    isExiting={exitingIds.has(item.productId)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right — summary */}
          <div className="md:sticky md:top-24">
            <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
              {/* Brand gradient stripe */}
              <div
                aria-hidden="true"
                className="h-[0.1875rem]"
                style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
              />

              <div className="p-5">
                <h2 className="text-base font-extrabold text-on-surface mb-4">
                  Resumen del pedido
                </h2>

                {/* Totals */}
                <div className="flex flex-col gap-2 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-on-surface-muted">
                      {isAuthenticated ? 'Subtotal' : 'Subtotal estimado'}
                    </span>
                    <span className="text-sm font-bold text-on-surface tabular-nums">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Descuento
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        &minus;{formatPrice(totalDiscount)}
                      </span>
                    </div>
                  )}

                  <div aria-hidden="true" className="h-px bg-stroke my-1" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-on-surface">Total</span>
                    <span className="text-lg font-black text-on-surface tabular-nums">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0.25rem_1rem_rgba(240,23,122,0.4)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
                  style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
                >
                  Proceder al pago
                </button>

                {!isAuthenticated && (
                  <p className="mt-3 text-center text-xs text-on-surface-muted/60 font-medium">
                    Necesitaras iniciar sesion para completar tu compra
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

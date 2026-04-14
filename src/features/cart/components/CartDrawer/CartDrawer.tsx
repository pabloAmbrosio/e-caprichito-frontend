import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useCartStore } from '../../store/cartStore';
import { useGuestCartStore } from '../../store/guestCartStore';
import { useUpdateCartItem } from '../../hooks/useUpdateCartItem';
import { useRemoveCartItem } from '../../hooks/useRemoveCartItem';
import { useAuthStore, useAuthModalStore } from '@/features/auth';
import { isAuthDismissed, dismissAuthReminder } from '../../infrastructure/guestCartStorage';
import type { DrawerDisplayItem } from '../../domain/types';
import { getVariantId } from '../../domain/types';
import { CartDrawerItem } from './CartDrawerItem';

function formatPrice(value: number): string {
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  });
}

export function CartDrawer() {
  const router = useRouter();
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthModalStore((s) => s.open);
  const guestItems = useGuestCartStore((s) => s.items);

  const { updateQuantity, updatingId } = useUpdateCartItem();
  const { removeItem, removingId } = useRemoveCartItem();

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [isDismissed, setIsDismissed] = useState(() => isAuthDismissed());

  // Normalize items from both stores into a unified display format
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

  // Focus trap + Escape
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => closeBtnRef.current?.focus(), 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeDrawer();
        return;
      }
      if (e.key !== 'Tab') return;

      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeDrawer]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      closeDrawer();
      openAuthModal();
      return;
    }
    closeDrawer();
    void router.push('/cart');
  }, [isAuthenticated, closeDrawer, openAuthModal, router]);

  const handleDismiss = useCallback(() => {
    dismissAuthReminder();
    setIsDismissed(true);
  }, []);

  // Subtotal derived from displayed items so it always stays in sync with quantity changes
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  // cart is only populated for auth users (cleared on logout), so no need for isAuthenticated guard
  const totalDiscount = (cart?.totalDiscount ?? 0) / 100;
  const total = subtotal - totalDiscount;

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-[60] bg-[#1A1A2E]/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full z-[70] w-[min(24rem,90vw)] bg-[#1A1A2E] flex flex-col shadow-[0_0_3rem_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Brand gradient stripe */}
        <div
          aria-hidden="true"
          className="h-[0.1875rem] shrink-0"
          style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="font-pacifico text-lg bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}
            >
              Tu Carrito
            </span>
            {itemCount > 0 && (
              <span
                className="text-[0.625rem] font-black text-white min-w-[1.375rem] h-[1.375rem] px-1.5 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
              >
                {itemCount}
              </span>
            )}
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar carrito"
            className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] outline-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div aria-hidden="true" className="mx-6 h-px bg-white/10 shrink-0" />

        {/* Auth reminder banner */}
        {!isAuthenticated && items.length > 0 && !isDismissed && (
          <div className="mx-6 mt-4 mb-2 p-3.5 rounded-xl border border-turquoise/20 bg-turquoise/5 shrink-0">
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-turquoise shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-[0.8125rem] font-bold text-white leading-snug">
                  Inicia sesion para guardar tu carrito
                </p>
                <p className="text-[0.6875rem] text-white/50 font-medium mt-1 leading-relaxed">
                  Tu carrito se sincronizara automaticamente al iniciar sesion.
                </p>
                <div className="flex items-center gap-3 mt-2.5">
                  <button
                    type="button"
                    onClick={() => { closeDrawer(); openAuthModal(); }}
                    className="text-[0.6875rem] font-extrabold text-turquoise hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-turquoise outline-none rounded"
                  >
                    Iniciar sesion
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-[0.6875rem] font-semibold text-white/30 hover:text-white/50 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-turquoise outline-none rounded"
                  >
                    No recordarme mas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
          {isLoading ? (
            /* Loading skeletons */
            <div className="py-4 flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3.5 animate-pulse">
                  <div className="w-[3.75rem] h-[3.75rem] rounded-xl bg-white/5" />
                  <div className="flex-1 flex flex-col gap-2 py-1">
                    <div className="h-3.5 w-3/4 rounded bg-white/8" />
                    <div className="h-3 w-1/3 rounded bg-white/5" />
                    <div className="h-7 w-24 rounded-lg bg-white/5 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, rgba(0,197,212,0.1), rgba(240,23,122,0.1))' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-9 h-9 text-white/25" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-white mb-1.5">
                Tu carrito esta vacio
              </h3>
              <p className="text-sm text-white/40 font-medium max-w-[14rem] leading-relaxed">
                Explora nuestros productos y encuentra algo especial
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-6 px-6 py-2.5 rounded-full text-sm font-extrabold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_1rem_rgba(0,197,212,0.35)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] outline-none"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
              >
                Explorar productos
              </button>
            </div>
          ) : (
            /* Item list */
            <div className="divide-y divide-white/8">
              {items.map((item, i) => (
                <div
                  key={item.productId}
                  style={
                    isOpen
                      ? { animation: `drawerLinkIn 0.3s ease ${i * 0.04 + 0.05}s both` }
                      : { opacity: 0 }
                  }
                >
                  <CartDrawerItem
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    isUpdating={updatingId === item.productId}
                    isRemoving={removingId === item.productId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — only when items exist */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-white/10 px-6 pt-4 pb-6">
            {/* Totals */}
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/50">
                  {isAuthenticated ? 'Subtotal' : 'Subtotal estimado'}
                </span>
                <span className="text-sm font-bold text-white/70 tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400/80">Descuento</span>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">
                    &minus;{formatPrice(totalDiscount)}
                  </span>
                </div>
              )}

              <div aria-hidden="true" className="h-px bg-white/8 my-1" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white">Total</span>
                <span className="text-base font-black text-white tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0.25rem_1rem_rgba(240,23,122,0.4)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] outline-none"
              style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
            >
              Ir a pagar
            </button>

            {!isAuthenticated && (
              <p className="mt-3 text-center text-[0.6875rem] text-white/35 font-medium">
                Necesitaras iniciar sesion para completar tu compra
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

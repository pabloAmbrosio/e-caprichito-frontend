import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useGuestCartStore } from '@/features/cart/store/guestCartStore';
import { useAuthStore } from '@/features/auth';

interface NavbarCartButtonProps {
  label: string;
}

export function NavbarCartButton({ label }: NavbarCartButtonProps) {
  const cart = useCartStore((s) => s.cart);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestItems = useGuestCartStore((s) => s.items);

  const itemCount = isAuthenticated
    ? (cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0)
    : guestItems.reduce((sum, item) => sum + item.quantity, 0);

  const [isBouncing, setIsBouncing] = useState(false);
  const prevCountRef = useRef(itemCount);

  // Badge bounce when count changes (not on initial load)
  useEffect(() => {
    if (itemCount > prevCountRef.current && prevCountRef.current >= 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  const ariaLabel = itemCount > 0
    ? `${label}, ${itemCount} producto${itemCount > 1 ? 's' : ''}`
    : label;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={ariaLabel}
      data-fly-cart-target=""
      className="group relative flex flex-col items-center justify-center gap-0.5 min-w-[2.75rem] min-h-[2.75rem] px-3 py-2 rounded-xl text-on-surface-muted transition-all duration-200 hover:text-pink hover:bg-pink/10 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
    >
      {itemCount > 0 && (
        <span
          key={itemCount}
          aria-hidden="true"
          className={`absolute top-1 right-1 bg-pink text-white text-[0.5rem] font-black min-w-[1rem] h-4 px-[0.2rem] rounded-full flex items-center justify-center ring-2 ring-surface transition-transform duration-300 ${
            isBouncing ? 'animate-[cartBadgeBounce_0.3s_ease]' : ''
          }`}
        >
          {itemCount}
        </span>
      )}

      <span
        aria-hidden="true"
        className="transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-px"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-5 h-5"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </span>

      <span className="text-[0.625rem] font-bold">{label}</span>
    </button>
  );
}

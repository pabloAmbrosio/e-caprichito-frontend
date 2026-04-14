const GUEST_CART_KEY = 'guest_cart';
const AUTH_DISMISSED_KEY = 'cart_auth_dismissed';

export interface GuestCartItem {
  productId: string;
  quantity: number;
  title: string;
  image: string;
  unitPrice: number;
  /** Product slug — stored to allow price verification against the backend on load */
  slug?: string;
}

function isValidGuestCartItem(item: unknown): item is GuestCartItem {
  if (!item || typeof item !== 'object') return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.productId === 'string' &&
    typeof i.quantity === 'number' &&
    typeof i.title === 'string' &&
    typeof i.image === 'string' &&
    typeof i.unitPrice === 'number'
  );
}

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidGuestCartItem);
  } catch {
    return [];
  }
}

export function setGuestCart(items: GuestCartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}

export function isAuthDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_DISMISSED_KEY) === 'true';
}

export function dismissAuthReminder(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_DISMISSED_KEY, 'true');
}

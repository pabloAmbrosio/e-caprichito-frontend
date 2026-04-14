import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { CategoryLink } from './NavbarCategoryBar';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { useAuthStore, useAuthModalStore } from '@/features/auth';
import { useAuth } from '@/features/auth';

interface NavbarMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categoryLinks?: CategoryLink[];
}

const MOBILE_LINKS_TOP = [
  { href: '/', label: 'Inicio', emoji: '🏠' },
  { href: '/products', label: 'Todos', emoji: '🛍️' },
];

const MOBILE_LINKS_BOTTOM = [
  { href: '/account/favorites', label: 'Favoritos', emoji: '♡' },
];

export function NavbarMobileMenu({ isOpen, onClose, categoryLinks }: NavbarMobileMenuProps) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const openAuthModal = useAuthModalStore((s) => s.open);
  // Construir la lista de links dinámicamente según auth state
  const accountLink = isLoading
    ? { href: '#', label: '', emoji: '', isAvatar: false as const, isSkeleton: true as const, isAuthTrigger: false as const }
    : isAuthenticated && user
      ? { href: '/account', label: user.username, emoji: '', isAvatar: true as const, isSkeleton: false as const, isAuthTrigger: false as const }
      : { href: '#', label: 'Entrar', emoji: '👤', isAvatar: false as const, isSkeleton: false as const, isAuthTrigger: true as const };

  const MOBILE_LINKS = [...MOBILE_LINKS_TOP, accountLink, ...MOBILE_LINKS_BOTTOM];

  // Skip "Inicio" from categories — it's already in MOBILE_LINKS
  const drawerCategoryLinks = categoryLinks?.filter((link) => link.href !== '/') ?? [];

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => closeBtnRef.current?.focus(), 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
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
  }, [isOpen, onClose]);

  return (
    <div className="lg:hidden">
      {/* Overlay con backdrop-blur */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-[#1A1A2E]/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer lateral derecho */}
      <div
        ref={drawerRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full z-[70] w-[min(20rem,85vw)] bg-[#1A1A2E] flex flex-col shadow-[0_0_3rem_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Franja gradiente — misma firma que el navbar */}
        <div
          aria-hidden="true"
          className="h-[0.1875rem] shrink-0"
          style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
        />

        {/* Cabecera del drawer */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0">
          <Link
            href="/"
            onClick={onClose}
            aria-label="La Central Caribeña — Ir al inicio"
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
          >
            <span
              className="font-pacifico text-xl block leading-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}
            >
              La Central
            </span>
            <span className="font-nunito text-[0.5625rem] font-black uppercase tracking-widest text-orange">
              Caribeña
            </span>
          </Link>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] outline-none"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            <span className="sr-only">Cerrar</span>
          </button>
        </div>

        {/* Separador */}
        <div aria-hidden="true" className="mx-6 h-px bg-white/10 shrink-0" />

        {/* Links de navegación */}
        <nav aria-label="Menú móvil" className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {MOBILE_LINKS.map((link, i) => {
              // Skeleton para el link de cuenta mientras carga la sesión
              if ('isSkeleton' in link && link.isSkeleton) {
                return (
                  <li
                    key="account-skeleton"
                    className="flex items-center gap-4 py-3.5 px-4"
                    aria-hidden="true"
                    style={
                      isOpen
                        ? { animation: `drawerLinkIn 0.3s ease ${i * 0.05 + 0.05}s both` }
                        : { opacity: 0 }
                    }
                  >
                    <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse shrink-0" />
                    <div className="w-16 h-3 rounded-full bg-white/10 animate-pulse" />
                  </li>
                );
              }

              // Auth trigger: open modal instead of navigating
              if ('isAuthTrigger' in link && link.isAuthTrigger) {
                return (
                  <li
                    key="auth-trigger"
                    style={
                      isOpen
                        ? { animation: `drawerLinkIn 0.3s ease ${i * 0.05 + 0.05}s both` }
                        : { opacity: 0 }
                    }
                  >
                    <button
                      type="button"
                      onClick={() => { onClose(); openAuthModal(); }}
                      className="flex items-center gap-4 py-3.5 px-4 rounded-xl w-full text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] outline-none text-white/70 hover:text-white hover:bg-white/8"
                    >
                      <span aria-hidden="true" className="text-lg w-6 text-center shrink-0">
                        {link.emoji}
                      </span>
                      <span className="font-nunito font-black text-base tracking-tight">
                        {link.label}
                      </span>
                    </button>
                  </li>
                );
              }

              const isCurrent = router.pathname === link.href;
              return (
                <li
                  key={link.href}
                  style={
                    isOpen
                      ? { animation: `drawerLinkIn 0.3s ease ${i * 0.05 + 0.05}s both` }
                      : { opacity: 0 }
                  }
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`flex items-center gap-4 py-3.5 px-4 rounded-xl no-underline transition-all duration-200 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] outline-none ${
                      isCurrent
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    {'isAvatar' in link && link.isAvatar ? (
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded-full text-[0.6875rem] font-extrabold text-white shrink-0 shadow-[0_2px_8px_rgba(0,197,212,0.3)]"
                        style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                        aria-hidden="true"
                      >
                        {link.label.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <span aria-hidden="true" className="text-lg w-6 text-center shrink-0">
                        {link.emoji}
                      </span>
                    )}
                    <span className="font-nunito font-black text-base tracking-tight">
                      {link.label}
                    </span>
                    {isCurrent && (
                      <span
                        aria-hidden="true"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-turquoise"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── Categorías (del NavbarCategoryBar) ─────────────────────── */}
          {drawerCategoryLinks.length > 0 && (
            <>
              <div aria-hidden="true" className="mx-2 my-4 h-px bg-white/10" />
              <p className="px-4 pb-2 text-[0.6875rem] font-bold text-white/40 uppercase tracking-widest">
                Categorías
              </p>
              <ul className="flex flex-col gap-1">
                {drawerCategoryLinks.map((link, i) => {
                  const isCurrent = router.pathname === link.href;
                  const delay = (MOBILE_LINKS.length + i) * 0.05 + 0.05;
                  return (
                    <li
                      key={link.href}
                      style={
                        isOpen
                          ? { animation: `drawerLinkIn 0.3s ease ${delay}s both` }
                          : { opacity: 0 }
                      }
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`flex items-center gap-4 py-3.5 px-4 rounded-xl no-underline transition-all duration-200 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] outline-none ${
                          isCurrent
                            ? 'bg-white/10 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/8'
                        }`}
                      >
                        <span aria-hidden="true" className="text-lg w-6 text-center shrink-0">
                          {link.emoji}
                        </span>
                        <span className="font-nunito font-black text-base tracking-tight">
                          {link.label}
                        </span>
                        {isCurrent && (
                          <span
                            aria-hidden="true"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-turquoise"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Ofertas CTA */}
              <div
                className="mt-4 pt-4 border-t border-white/10 px-1"
                style={
                  isOpen
                    ? { animation: `drawerLinkIn 0.3s ease ${(MOBILE_LINKS.length + drawerCategoryLinks.length) * 0.05 + 0.1}s both` }
                    : { opacity: 0 }
                }
              >
                <Link
                  href="/ofertas"
                  onClick={onClose}
                  className="flex items-center justify-center w-full bg-yellow text-text-dark px-4 py-3 rounded-xl text-sm font-bold no-underline transition-all duration-150 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] outline-none"
                >
                  🔥 Ofertas
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Footer del drawer */}
        <div className="px-6 pb-8 pt-4 shrink-0 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => { onClose(); void logout(); }}
                className="font-nunito text-xs text-white/50 font-bold hover:text-pink transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] rounded outline-none"
              >
                Cerrar sesión
              </button>
            ) : (
              <p className="font-nunito text-xs text-white/30 font-semibold tracking-wide">
                Tu tienda caribeña favorita ✦
              </p>
            )}
            {isAuthenticated && user?.adminRole !== 'CUSTOMER' && (
              <Link
                href="/backoffice"
                onClick={onClose}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[0.6rem] font-extrabold uppercase tracking-wide transition-all duration-150 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] outline-none"
                style={{ background: 'rgba(0,197,212,0.15)', color: '#00C5D4' }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
                Admin
              </Link>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

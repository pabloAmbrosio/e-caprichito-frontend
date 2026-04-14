import Link from 'next/link';
import { useAuthStore, useAuthModalStore } from '@/features/auth';
import { useAuth } from '@/features/auth';
import { NavbarActionButton } from './NavbarActionButton';
import { NavbarUserAvatar } from './NavbarUserAvatar';
import { NavbarCartButton } from './NavbarCartButton';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

const AccountIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const FavoritesIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LogoutIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export function NavbarActions() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const openAuthModal = useAuthModalStore((s) => s.open);

  return (
    <div className="flex items-center gap-1 shrink-0">
      {isLoading ? (
        /* ── Skeleton: mismas dimensiones que NavbarUserAvatar ── */
        <div className="flex flex-col items-center justify-center gap-1 min-w-[2.75rem] min-h-[2.75rem] px-3 py-2" aria-hidden="true">
          <div className="w-6 h-6 rounded-full bg-stroke/60 animate-pulse" />
          <div className="w-8 h-1.5 rounded-full bg-stroke/40 animate-pulse" />
        </div>
      ) : isAuthenticated && user ? (
        <>
          {user.adminRole !== 'CUSTOMER' && (
            <Link
              href="/backoffice"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.6rem] font-extrabold uppercase tracking-wide transition-all duration-150 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
              style={{ background: 'rgba(0,197,212,0.12)', color: '#00C5D4' }}
              aria-label="Ir al backoffice de administración"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Admin
            </Link>
          )}
          <NavbarUserAvatar username={user.username} />
          <button
            type="button"
            onClick={() => { void logout(); }}
            aria-label="Cerrar sesión"
            className="group flex flex-col items-center justify-center gap-0.5 min-w-[2.75rem] min-h-[2.75rem] px-3 py-2 rounded-xl text-on-surface-muted transition-all duration-200 hover:text-turquoise hover:bg-turquoise/10 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
          >
            <span
              aria-hidden="true"
              className="transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-px"
            >
              {LogoutIcon}
            </span>
            <span className="text-[0.625rem] font-bold">Salir</span>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={openAuthModal}
          className="group flex flex-col items-center justify-center gap-0.5 min-w-[2.75rem] min-h-[2.75rem] px-3 py-2 rounded-xl text-on-surface-muted transition-all duration-200 hover:text-turquoise hover:bg-turquoise/10 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
        >
          <span
            aria-hidden="true"
            className="transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-px"
          >
            {AccountIcon}
          </span>
          <span className="text-[0.625rem] font-bold">Cuenta</span>
        </button>
      )}
      <NavbarActionButton href="/account/favorites" label="Favoritos" icon={FavoritesIcon} />
      <ThemeToggle />

      {/* Separador visual */}
      <div aria-hidden="true" className="w-px h-8 bg-stroke mx-1 shrink-0" />

      <NavbarCartButton label="Carrito" />
    </div>
  );
}

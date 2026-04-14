import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/features/auth';
import { TiendaLayout } from './TiendaLayout';
import type { CategoryLink } from '@/shared/components/Navbar';

interface AccountNavItem {
  href: string;
  label: string;
  emoji: string;
}

const NAV_ITEMS: AccountNavItem[] = [
  { href: '/account', label: 'Mi Cuenta', emoji: '🏠' },
  { href: '/account/profile', label: 'Mi Perfil', emoji: '👤' },
  { href: '/account/orders', label: 'Mis Pedidos', emoji: '📦' },
  { href: '/account/addresses', label: 'Direcciones', emoji: '📍' },
  { href: '/account/favorites', label: 'Mis Favoritos', emoji: '❤️' },
];

interface AccountLayoutProps {
  children: ReactNode;
  title: string;
  categoryLinks?: CategoryLink[];
}

export function AccountLayout({ children, title, categoryLinks }: AccountLayoutProps) {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    void logout();
  };

  const initial = user?.username.charAt(0).toUpperCase() ?? '?';

  return (
    <TiendaLayout categoryLinks={categoryLinks} showTopbar={false}>
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
        {/* Mobile: horizontal tab bar */}
        <nav
          className="lg:hidden flex gap-1.5 overflow-x-auto scrollbar-hide pb-3 mb-6 border-b border-stroke"
          aria-label="Navegación de cuenta"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/account'
                ? router.pathname === '/account'
                : router.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200',
                  isActive
                    ? 'bg-turquoise/10 text-turquoise shadow-[0_0_0_1px_rgba(0,197,212,0.2)]'
                    : 'text-on-surface-muted hover:bg-surface-overlay hover:text-on-surface',
                ].join(' ')}
              >
                <span aria-hidden="true">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap text-pink hover:bg-pink/10 transition-colors duration-150 ml-auto"
          >
            <span aria-hidden="true">🚪</span>
            Salir
          </button>
        </nav>

        <div className="flex gap-8 lg:gap-10 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex flex-col gap-1 w-56 shrink-0 sticky top-24">
            {/* User greeting */}
            {user && (
              <div className="mb-5 px-4 py-4 bg-surface rounded-2xl border border-stroke relative overflow-hidden">
                {/* Decorative gradient accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-[0.1875rem]"
                  style={{ background: 'linear-gradient(90deg, #00C5D4, #009BAB)' }}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-extrabold text-white shrink-0 shadow-[0_2px_8px_rgba(0,197,212,0.25)]"
                    style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
                    aria-hidden="true"
                  >
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-on-surface-muted font-semibold uppercase tracking-wide">
                      Hola,
                    </p>
                    <p className="text-on-surface font-extrabold truncate">{user.username}</p>
                  </div>
                </div>
                {user.customerRole && (
                  <span className="inline-block mt-2.5 text-[0.6875rem] font-bold px-2.5 py-0.5 rounded-full bg-turquoise/10 text-turquoise uppercase tracking-wide">
                    {user.customerRole}
                  </span>
                )}
              </div>
            )}

            <nav aria-label="Navegación de cuenta">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/account'
                    ? router.pathname === '/account'
                    : router.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-turquoise/10 text-turquoise font-bold shadow-[inset_3px_0_0_0_#00C5D4] pl-4'
                        : 'text-on-surface-muted hover:bg-surface-overlay hover:text-on-surface hover:translate-x-0.5',
                    ].join(' ')}
                  >
                    <span className="text-base" aria-hidden="true">
                      {item.emoji}
                    </span>
                    {item.label}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-turquoise" />
                    )}
                  </Link>
                );
              })}

              <div className="my-3 border-t border-stroke" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-pink hover:bg-pink/10 hover:translate-x-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
              >
                <span className="text-base" aria-hidden="true">
                  🚪
                </span>
                Cerrar Sesión
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-on-surface">{title}</h1>
              <div
                className="mt-2 h-[0.1875rem] w-12 rounded-full"
                style={{ background: 'linear-gradient(90deg, #00C5D4, #009BAB)' }}
                aria-hidden="true"
              />
            </div>
            {children}
          </main>
        </div>
      </div>
    </TiendaLayout>
  );
}

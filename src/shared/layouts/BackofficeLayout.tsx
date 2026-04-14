import { type ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useAuth } from '@/features/auth';
import { useStaffSocket } from '@/features/payments/hooks/useStaffSocket';
import { usePaymentProofListener } from '@/features/payments/hooks/usePaymentProofListener';
import { useOrderCreatedListener } from '@/features/payments/hooks/useOrderCreatedListener';
import { requestNotificationPermission } from '@/shared/utils/nativeNotification';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: '/backoffice', label: 'Inicio', icon: <GridIcon /> },
  { href: '/backoffice/orders', label: 'Órdenes', icon: <ShoppingBagIcon /> },
  { href: '/backoffice/payments', label: 'Pagos', icon: <CreditCardIcon /> },
  { href: '/backoffice/shipments', label: 'Envíos', icon: <TruckIcon /> },
  { href: '/backoffice/carts', label: 'Carritos', icon: <CartIcon /> },
  { href: '/backoffice/categories', label: 'Categorías', icon: <TagIcon /> },
  { href: '/backoffice/products', label: 'Productos', icon: <BoxIcon /> },
  { href: '/backoffice/users', label: 'Usuarios', icon: <UsersIcon /> },
  { href: '/backoffice/inventory', label: 'Inventario', icon: <LayersIcon /> },
  { href: '/backoffice/promotions', label: 'Promociones', icon: <PercentIcon /> },
];

interface BackofficeLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function BackofficeLayout({ children, title, breadcrumbs }: BackofficeLayoutProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);

  useStaffSocket();
  usePaymentProofListener();
  useOrderCreatedListener();
  useEffect(() => { requestNotificationPermission(); }, []);

  const handleLogout = () => { void logout(); };
  const initial = user?.username.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-raised)' }}>
      {/* Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 fixed top-0 left-0 h-full z-40"
        style={{ background: '#0D0D1A' }}
      >
        {/* Brand gradient stripe */}
        <div
          className="h-1 w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <Link href="/backoffice" className="flex items-center gap-2 group">
            <span
              className="font-['Pacifico'] text-lg leading-none"
              style={{
                background: 'linear-gradient(135deg, #00C5D4, #F0177A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              La Central
            </span>
            <span
              className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(0,197,212,0.12)', color: '#00C5D4' }}
            >
              Admin
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5" aria-label="Navegación de backoffice">
          <p className="px-3 mb-2 text-[0.625rem] font-extrabold uppercase tracking-[0.14em] text-white/30">
            Gestión
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/backoffice'
              ? router.pathname === '/backoffice'
              : router.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-turquoise/10 text-turquoise shadow-[inset_3px_0_0_0_#00C5D4]'
                    : 'text-white/50 hover:bg-white/[0.05] hover:text-white/90',
                ].join(' ')}
              >
                <span className={isActive ? 'text-turquoise' : 'text-white/40 group-hover:text-white/70'}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-turquoise" />}
              </Link>
            );
          })}

        </nav>

        {/* Go to store */}
        <div className="px-3 pb-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:bg-white/[0.05] hover:text-white/90 transition-all duration-200 group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-white/40 group-hover:text-white/70">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Ir a la tienda
          </Link>
        </div>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
              >
                {initial}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white/80 truncate">{user.username}</p>
                <p className="text-[0.6rem] text-white/30 font-semibold uppercase tracking-wide">{user.adminRole}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-pink/70 hover:bg-pink/10 hover:text-pink transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
          >
            <LogOutIcon />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 border-b"
          style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}
        >
          <div className="px-6 md:px-8 h-14 flex items-center gap-2">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
              <Link
                href="/backoffice"
                className="font-semibold transition-colors duration-150"
                style={{ color: 'var(--on-surface-muted)' }}
              >
                Backoffice
              </Link>
              {breadcrumbs?.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }}>
                    <ChevronRightIcon />
                  </span>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="font-semibold transition-colors duration-150 hover:text-turquoise"
                      style={{ color: 'var(--on-surface-muted)' }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-bold" style={{ color: 'var(--on-surface)' }}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 md:px-8 py-8">
          <h1 className="text-2xl font-extrabold mb-8" style={{ color: 'var(--on-surface)' }}>
            {title}
          </h1>
          {children}
        </main>
      </div>
    </div>
  );
}

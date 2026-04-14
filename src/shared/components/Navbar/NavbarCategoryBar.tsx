import Link from 'next/link';
import { useRouter } from 'next/router';

export interface CategoryLink {
  href: string;
  label: string;
  emoji: string;
}

interface NavbarCategoryBarProps {
  links: CategoryLink[];
  activeHref?: string;
}

const INICIO_LINK: CategoryLink = { href: '/', label: 'Inicio', emoji: '🏠' };
const TODOS_LINK: CategoryLink = { href: '/products', label: 'Todos', emoji: '🛍️' };

export function NavbarCategoryBar({ links, activeHref }: NavbarCategoryBarProps) {
  const router = useRouter();
  const currentPath = activeHref ?? router.asPath.split('?')[0]!;

  const allLinks = [INICIO_LINK, TODOS_LINK, ...links];

  return (
    <nav
      aria-label="Navegación de categorías"
      className="hidden lg:block bg-surface-raised border-b border-stroke/60 shadow-[0_2px_8px_rgba(0,197,212,0.08)]"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center h-11 gap-1">
          {allLinks.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'relative whitespace-nowrap text-sm font-semibold px-3.5 py-2 rounded-md shrink-0',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1',
                  isActive
                    ? 'text-turquoise'
                    : 'text-on-surface-muted hover:text-turquoise hover:bg-turquoise/[0.06]',
                ].join(' ')}
              >
                {link.emoji} {link.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full bg-turquoise"
                  />
                )}
              </Link>
            );
          })}

          <Link
            href="/ofertas"
            className={[
              'ml-auto bg-yellow text-text-dark no-underline',
              'px-3.5 py-1.5 rounded-[1.25rem]',
              'text-xs font-bold whitespace-nowrap',
              'transition-all duration-150',
              'hover:shadow-[0_0.25rem_0.6rem_rgba(255,214,0,0.35)] hover:scale-[1.03]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-1',
            ].join(' ')}
          >
            🔥 Ofertas
          </Link>
        </div>
      </div>
    </nav>
  );
}

import { useState, useEffect, useRef } from 'react';
import { NavbarLogo } from './NavbarLogo';
import { NavbarSearch } from './NavbarSearch';
import { NavbarActions } from './NavbarActions';
import { NavbarCartButton } from './NavbarCartButton';
import { NavbarMobileMenu } from './NavbarMobileMenu';
import { NavbarCategoryBar } from './NavbarCategoryBar';
import type { CategoryLink } from './NavbarCategoryBar';

interface NavbarProps {
  categoryLinks?: CategoryLink[];
}

export function Navbar({ categoryLinks }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Bloquear scroll del body mientras el drawer esté abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    // Devolver foco al botón hamburguesa al cerrar
    hamburgerRef.current?.focus();
  }

  return (
    <>
      <nav aria-label="Navegación principal" className="bg-surface shadow-[var(--shadow-surface-header)] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-3 flex items-center gap-4 lg:gap-5">

          <NavbarLogo title="El caprichito" subtitle="caribeño" />
          <NavbarSearch placeholder="Busca productos, marcas y más..." buttonLabel="Buscar" />

          <div className="hidden lg:flex items-center">
            <NavbarActions />
          </div>

          {/* Carrito + Hamburguesa — solo visible en < lg */}
          <div className="lg:hidden ml-auto flex items-center gap-1">
            <NavbarCartButton label="Carrito" />
            <button
              ref={hamburgerRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center rounded-xl text-text-mid transition-colors duration-200 hover:text-turquoise hover:bg-turquoise/10 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
            >
            {/* 3 líneas independientes que morphean a X */}
            <span aria-hidden="true" className="flex flex-col justify-center items-center w-6 h-5 gap-[5px]">
              <span
                className={`block h-[2px] w-6 bg-current origin-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  menuOpen ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`block h-[2px] w-6 bg-current transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                }`}
              />
              <span
                className={`block h-[2px] w-6 bg-current origin-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  menuOpen ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </span>
            <span className="sr-only">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
            </button>
          </div>
        </div>

        <NavbarMobileMenu
          isOpen={menuOpen}
          onClose={closeMenu}
          categoryLinks={categoryLinks}
        />

        {/* Franja gradiente inferior — siempre visible */}
        <div
          aria-hidden="true"
          className="h-[0.1875rem]"
          style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
        />
      </nav>

      {categoryLinks && <NavbarCategoryBar links={categoryLinks} />}
    </>
  );
}

import Link from 'next/link';

const TIENDA_LINKS = [
  { href: '/productos', label: 'Todos los productos' },
  { href: '/ofertas', label: 'Ofertas del día' },
  { href: '/mas-vendidos', label: 'Más vendidos' },
];

const AYUDA_LINKS = [
  { href: '/seguimiento', label: 'Seguimiento' },
  { href: '/policies/returns', label: 'Devoluciones' },
  { href: '/contacto', label: 'Contacto' },
];

const REDES_LINKS = [
  { href: '#', label: '📘 Facebook' },
  { href: '#', label: '📸 Instagram' },
  { href: '#', label: '🎵 TikTok' },
];

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-turquoise text-[11px] font-black uppercase tracking-[1px] mb-3">
        {title}
      </h4>
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="block text-xs font-semibold text-white/60 no-underline mb-1.5 hover:text-white/90"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-text-dark text-white pt-9 px-8 pb-5">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-8 mb-7">
        {/* Brand */}
        <div>
          <span className="font-pacifico text-xl text-white">La Central Caribeña</span>
          <p className="text-xs font-semibold text-white/60 leading-relaxed mt-2.5">
            Tu tienda de confianza en Campeche.<br />
            Productos frescos y auténticos del Caribe.
          </p>
        </div>

        <FooterColumn title="Tienda" links={TIENDA_LINKS} />
        <FooterColumn title="Ayuda" links={AYUDA_LINKS} />
        <FooterColumn title="Redes" links={REDES_LINKS} />
      </div>

      <div className="border-t border-white/8 pt-4 text-center text-[11px] text-white/40">
        © 2026 La Central Caribeña — Hecho con 💙 en Campeche, México
      </div>
    </footer>
  );
}

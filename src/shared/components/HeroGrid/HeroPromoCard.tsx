import Link from 'next/link';

export interface HeroPromoCardData {
  gradient: string;
  headline: string;
  title: string;
  subtitle?: string | null;
  emoji: string;
  href?: string;
  image?: string | null;
  badgeColor?: string | null;
}

interface HeroPromoCardProps {
  data: HeroPromoCardData;
}

/* ── Variante con imagen: foto full-bleed + overlay ── */

function ImageCard({ data }: HeroPromoCardProps) {
  return (
    <div className="rounded-2xl relative overflow-hidden h-full transition-transform duration-200 hover:scale-[1.02]">
      {/* Imagen full-bleed */}
      <img
        src={data.image}
        alt={data.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay gradient — legibilidad del texto */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)',
        }}
      />

      {/* Texto — zona inferior */}
      <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 z-10">
        <h3 className="text-sm lg:text-base font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
          {data.title}
        </h3>
        {data.subtitle && (
          <p className="text-[0.6875rem] text-white/80 mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            {data.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Variante sin imagen: gradient + emoji (diseño original) ── */

function GradientCard({ data }: HeroPromoCardProps) {
  return (
    <div
      className="rounded-2xl p-6 lg:p-7 text-white relative overflow-hidden h-full flex flex-col justify-center transition-transform duration-200 hover:scale-[1.02]"
      style={{ background: data.gradient }}
    >
      {/* Círculo decorativo */}
      <div
        className="absolute -top-5 -right-5 w-[7.5rem] h-[7.5rem] rounded-full bg-white/10"
        aria-hidden="true"
      />

      <span className="font-pacifico text-[2.5rem] lg:text-[3rem] block leading-none mb-1">
        {data.headline}
      </span>
      <h3 className="text-sm font-bold">{data.title}</h3>
      {data.subtitle && (
        <p className="text-[0.6875rem] opacity-80 mt-1">{data.subtitle}</p>
      )}

      <span
        className="absolute right-3.5 bottom-2 text-[2.75rem] lg:text-[3.5rem] opacity-35 select-none pointer-events-none"
        aria-hidden="true"
      >
        {data.emoji}
      </span>
    </div>
  );
}

/* ── Componente público ── */

export function HeroPromoCard({ data }: HeroPromoCardProps) {
  const inner = data.image
    ? <ImageCard data={data} />
    : <GradientCard data={data} />;

  if (data.href) {
    return (
      <Link
        href={data.href}
        className="block h-full no-underline rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}

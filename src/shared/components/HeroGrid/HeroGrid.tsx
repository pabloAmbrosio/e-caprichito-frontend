import { HeroBanner } from './HeroBanner';
import { HeroPromoCard } from './HeroPromoCard';
import type { HeroBannerSlide } from './HeroBanner';
import type { HeroPromoCardData } from './HeroPromoCard';

interface HeroGridProps {
  slides: HeroBannerSlide[];
  promoCards: HeroPromoCardData[];
}

/* ── Card estática de propuesta de valor (envíos gratis) ── */

function ValuePropositionCard() {
  return (
    <div
      className="rounded-2xl p-6 lg:p-7 text-white relative overflow-hidden h-full flex flex-col justify-center"
      style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
    >
      {/* Círculos decorativos */}
      <div
        className="absolute -top-5 -right-5 w-[7.5rem] h-[7.5rem] rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-8 -left-8 w-[6rem] h-[6rem] rounded-full bg-white/5"
        aria-hidden="true"
      />

      <span className="text-[2.5rem] lg:text-[3rem] block leading-none mb-2" aria-hidden="true">
        🚚
      </span>
      <h3 className="font-pacifico text-lg lg:text-xl leading-tight mb-1">
        Envío gratis
      </h3>
      <p className="text-[0.75rem] lg:text-[0.8125rem] opacity-85 leading-relaxed">
        En Sabancuy y zonas cercanas. Recibe tu pedido sin costo de envío.
      </p>

      <span
        className="absolute right-3.5 bottom-2 text-[2.75rem] lg:text-[3.5rem] opacity-20 select-none pointer-events-none"
        aria-hidden="true"
      >
        📦
      </span>
    </div>
  );
}

/* ── Layouts del bento grid según cantidad de promos ── */

function BentoThree({ cards }: { cards: HeroPromoCardData[] }) {
  const [main, ...rest] = cards;
  return (
    <div className="grid grid-cols-1 md:grid-rows-[1fr_1fr] gap-4 lg:gap-5">
      {main && (
        <div className="min-h-[12rem] sm:min-h-[14rem] lg:min-h-0">
          <HeroPromoCard data={main} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {rest.map((card, i) => (
          <div key={i} className="min-h-[10rem] sm:min-h-[12rem] lg:min-h-0">
            <HeroPromoCard data={card} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BentoTwo({ cards }: { cards: HeroPromoCardData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-rows-[1fr_1fr] gap-4 lg:gap-5">
      {cards.map((card, i) => (
        <div key={i} className="min-h-[12rem] sm:min-h-[14rem] lg:min-h-0">
          <HeroPromoCard data={card} />
        </div>
      ))}
    </div>
  );
}

function BentoOne({ card }: { card: HeroPromoCardData }) {
  return (
    <div className="flex flex-col gap-4 lg:gap-5 h-full">
      <div className="min-h-[12rem] sm:min-h-[14rem] lg:min-h-0 flex-[8]">
        <HeroPromoCard data={card} />
      </div>
      <div className="min-h-[5rem] lg:min-h-0 flex-[2]">
        <ValuePropositionCard />
      </div>
    </div>
  );
}

/* ── Componente principal ── */

export function HeroGrid({ slides, promoCards }: HeroGridProps) {
  const count = promoCards.length;

  // Sin promos → slider ocupa todo el ancho
  if (count === 0) {
    return (
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 pt-6 lg:pt-8">
        <div className="h-[50vh] min-h-[22rem] sm:min-h-[26rem] lg:h-[calc(100vh-15rem)]">
          <HeroBanner slides={slides} />
        </div>
      </section>
    );
  }

  const gridCols = 'lg:grid-cols-2';

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 pt-6 lg:pt-8">
      <div className={`grid grid-cols-1 ${gridCols} gap-4 lg:gap-5 lg:h-[calc(100vh-15rem)]`}>
        {/* Carousel principal */}
        <div className="h-[50vh] min-h-[22rem] sm:min-h-[26rem] lg:h-auto lg:min-h-0">
          <HeroBanner slides={slides} />
        </div>

        {/* Bento grid — adaptativo según cantidad de promos */}
        {count >= 3 && <BentoThree cards={promoCards.slice(0, 3)} />}
        {count === 2 && <BentoTwo cards={promoCards.slice(0, 2)} />}
        {count === 1 && <BentoOne card={promoCards[0]} />}
      </div>
    </section>
  );
}

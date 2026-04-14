import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export interface HeroBannerSlide {
  /** Abstract product ID — used for view-transition-name on the active slide */
  productId: string;
  badge?: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  /** URL of the full-bleed product image (model photo) */
  image: string;
}

interface HeroBannerProps {
  slides: HeroBannerSlide[];
}

export function HeroBanner({ slides }: HeroBannerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden h-full"
      aria-roledescription="carousel"
      aria-label="Productos destacados"
    >
      {/* Viewport */}
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} de ${slides.length}`}
              className="relative flex-[0_0_100%] min-w-0 text-white"
            >
              {/* Product image — full view, no cropping.
                  viewTransitionName only on the selected slide so Embla loop
                  clones (which are separate DOM nodes) don't create duplicates. */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-contain"
                style={i === selectedIndex ? { viewTransitionName: `product-img-${slide.productId}` } : undefined}
              />

              {/* Gradient overlay — only bottom zone for text legibility */}
              <div
                className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none"
                aria-hidden="true"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 40%, transparent 100%)',
                }}
              />

              {/* Badge — top left */}
              {slide.badge && (
                <span className="absolute top-5 left-5 sm:top-6 sm:left-6 inline-block bg-yellow text-text-dark text-[0.625rem] font-black py-1 px-3.5 rounded-full uppercase tracking-widest z-10">
                  {slide.badge}
                </span>
              )}

              {/* Text content — bottom left */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10 pb-14 sm:pb-16 flex flex-col z-10">
                <h2 className="font-pacifico text-xl sm:text-2xl lg:text-[2.5rem] leading-[1.1] mb-2 lg:mb-3 max-w-[24rem] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  {slide.title}
                </h2>

                <p className="text-xs sm:text-sm font-semibold opacity-90 mb-4 lg:mb-5 max-w-[22rem] leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                  {slide.description}
                </p>

                <Link
                  href={slide.ctaHref}
                  className="inline-flex items-center justify-center self-start gap-1.5 py-2.5 px-6 sm:py-3 sm:px-7 rounded-full font-nunito font-extrabold text-xs sm:text-sm text-white no-underline transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0.25rem_0.75rem_rgba(240,23,122,0.4)] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent outline-none"
                  style={{
                    background: 'linear-gradient(135deg, #F0177A, #C0005A)',
                    boxShadow: '0 4px 16px rgba(240,23,122,0.35)',
                  }}
                >
                  {slide.ctaLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Ir a slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? 'w-7 h-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

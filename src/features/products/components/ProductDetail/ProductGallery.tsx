import { useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useAuthStore } from '@/features/auth';
import { useLikeToggle } from '../../hooks/useLikeToggle';
import type { ImageJson } from '../../domain/types';

export interface RibbonBadge {
  label: string;
  color: string;
}

interface ProductGalleryProps {
  productId: string;
  images: ImageJson[];
  title: string;
  /** view-transition-name value for the hero animation */
  transitionName: string;
  ribbonBadge?: RibbonBadge | null;
}

const PLACEHOLDER = '/images/products/placeholder.jpg';

/** Oscurece un color hex por un factor (0–1). factor=0.7 → 30% más oscuro */
function darkenHex(hex: string, factor: number): string {
  const h = hex.replace('#', '');
  const r = Math.round(parseInt(h.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(h.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(h.slice(4, 6), 16) * factor);
  return `rgb(${r},${g},${b})`;
}

function GalleryRibbon({ badge }: { badge: RibbonBadge }) {
  const foldColor = darkenHex(badge.color, 0.5);
  return (
    <div
      className="product-ribbon absolute -top-[0.625rem] -right-[0.625rem] z-20 h-[12rem] w-[12rem] overflow-hidden pointer-events-none"
      style={{ '--ribbon-fold': foldColor } as React.CSSProperties}
      aria-hidden="true"
    >
      <div
        className="absolute left-[12px] -top-[38px] w-[18rem] origin-left rotate-45 py-[0.75rem] text-center text-white text-[0.9375rem] font-black uppercase tracking-wider leading-none"
        style={{
          background: `linear-gradient(135deg, ${badge.color}, ${darkenHex(badge.color, 0.8)}, ${badge.color})`,
          boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
        }}
      >
        {badge.label}
      </div>
    </div>
  );
}

// ── Shared like state props ──
interface LikeState {
  isLiked: boolean;
  isToggling: boolean;
  toggle: () => Promise<void>;
}

/**
 * Hook that detects double-click / double-tap on an element.
 * Calls `onDoubleTap` without interfering with single taps or carousel swipes.
 */
function useDoubleTap(onDoubleTap: () => void) {
  const lastTapRef = useRef(0);

  const handleDoubleAction = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      onDoubleTap();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [onDoubleTap]);

  return handleDoubleAction;
}

/**
 * Animated heart burst that appears on double-tap (Instagram-style).
 * Shows a filled heart that scales up then fades out.
 */
function HeartBurst({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-20 h-20 text-white drop-shadow-[0_4px_20px_rgba(240,23,122,0.6)] animate-[heartBurst_0.8s_ease_forwards]"
        aria-hidden="true"
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true">
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LikeButton({ title, like }: { title: string; like: LikeState }) {
  return (
    <button
      type="button"
      disabled={like.isToggling}
      onClick={() => void like.toggle()}
      className={[
        'absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center',
        'bg-surface/85 backdrop-blur-sm border shadow-[0_2px_12px_rgba(0,0,0,0.15)]',
        'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        'disabled:opacity-50',
        like.isLiked
          ? 'text-pink border-pink/30 bg-pink/10'
          : 'text-on-surface-muted border-stroke/40 hover:bg-pink/10 hover:text-pink hover:border-pink/30',
      ].join(' ')}
      aria-label={like.isLiked ? `Quitar ${title} de favoritos` : `Agregar ${title} a favoritos`}
      aria-pressed={like.isLiked}
    >
      <HeartIcon filled={like.isLiked} />
    </button>
  );
}

/**
 * Hook to manage the heart burst animation with key-based remounting.
 * Returns [burstKey, triggerBurst] — burstKey > 0 means show the heart.
 */
function useHeartBurst() {
  const [burstKey, setBurstKey] = useState(0);

  const trigger = useCallback(() => {
    setBurstKey((k) => k + 1);
  }, []);

  // Auto-clear after animation
  useEffect(() => {
    if (burstKey === 0) return;
    const timer = setTimeout(() => setBurstKey(0), 850);
    return () => clearTimeout(timer);
  }, [burstKey]);

  return [burstKey, trigger] as const;
}

/* ── Desktop gallery: thumbnail strip + main image ── */
function DesktopGallery({
  images,
  title,
  transitionName,
  like,
  onDoubleTap,
  burstKey,
  ribbonBadge,
}: {
  images: ImageJson[];
  title: string;
  transitionName: string;
  like: LikeState | null;
  onDoubleTap: () => void;
  burstKey: number;
  ribbonBadge?: RibbonBadge | null;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = images[selectedIndex] ?? null;
  const handleDoubleTap = useDoubleTap(onDoubleTap);

  return (
    <div className="hidden lg:flex gap-3 aspect-[3/4]">
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-[4.5rem] shrink-0 overflow-y-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={img.thumbnailUrl || i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={[
                'aspect-square rounded-lg overflow-hidden border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise',
                i === selectedIndex
                  ? 'border-turquoise shadow-[0_0_0_1px_#00C5D4]'
                  : 'border-stroke/60 hover:border-turquoise/50 opacity-70 hover:opacity-100',
              ].join(' ')}
              aria-label={`Ver imagen ${i + 1}${img.alt ? `: ${img.alt}` : ''}`}
              aria-pressed={i === selectedIndex}
            >
              <img
                src={img.thumbnailUrl || img.imageUrl}
                alt={img.alt ?? `${title} - imagen ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div
        className="relative flex-1 rounded-2xl bg-surface-overlay select-none"
        onClick={handleDoubleTap}
      >
        {ribbonBadge && <GalleryRibbon badge={ribbonBadge} />}
        <div className="relative rounded-2xl overflow-hidden h-full">
          {like && <LikeButton title={title} like={like} />}
          <HeartBurst key={burstKey} show={burstKey > 0} />
          <img
            src={mainImage?.imageUrl ?? PLACEHOLDER}
            alt={mainImage?.alt ?? title}
            className="w-full h-full object-cover transition-opacity duration-200"
            style={{ viewTransitionName: transitionName }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Mobile gallery: Embla carousel ── */
function MobileGallery({
  images,
  title,
  transitionName,
  like,
  onDoubleTap,
  burstKey,
  ribbonBadge,
}: {
  images: ImageJson[];
  title: string;
  transitionName: string;
  like: LikeState | null;
  onDoubleTap: () => void;
  burstKey: number;
  ribbonBadge?: RibbonBadge | null;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleDoubleTap = useDoubleTap(onDoubleTap);

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

  const displayImages = images.length > 0 ? images : [null];

  return (
    <div
      className="lg:hidden relative rounded-2xl bg-surface-overlay aspect-[4/5] select-none"
      onClick={handleDoubleTap}
    >
      {ribbonBadge && <GalleryRibbon badge={ribbonBadge} />}
      <div className="relative rounded-2xl overflow-hidden h-full">
      {like && <LikeButton title={title} like={like} />}
      <HeartBurst key={burstKey} show={burstKey > 0} />

      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full touch-pan-y">
          {displayImages.map((img, i) => (
            <div key={i} className="relative flex-[0_0_100%] min-w-0">
              <img
                src={img?.imageUrl ?? PLACEHOLDER}
                alt={img?.alt ?? `${title} - imagen ${i + 1}`}
                className="w-full h-full object-cover"
                style={i === 0 ? { viewTransitionName: transitionName } : undefined}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? 'w-6 h-2 bg-white shadow-[0_0_6px_rgba(255,255,255,0.5)]'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export function ProductGallery({ productId, images, title, transitionName, ribbonBadge }: ProductGalleryProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isLiked, toggle, isToggling } = useLikeToggle(productId);
  const [burstKey, triggerBurst] = useHeartBurst();

  const like: LikeState | null = isAuthenticated
    ? { isLiked, toggle, isToggling }
    : null;

  const handleDoubleTapLike = useCallback(() => {
    if (!isAuthenticated || isToggling) return;
    // Instagram behavior: double-tap always likes (never unlikes)
    if (!isLiked) {
      void toggle();
    }
    // Always show the burst animation (even if already liked)
    triggerBurst();
  }, [isAuthenticated, isLiked, isToggling, toggle, triggerBurst]);

  return (
    <>
      <DesktopGallery
        images={images}
        title={title}
        transitionName={transitionName}
        like={like}
        onDoubleTap={handleDoubleTapLike}
        burstKey={burstKey}
        ribbonBadge={ribbonBadge}
      />
      <MobileGallery
        images={images}
        title={title}
        transitionName={transitionName}
        like={like}
        onDoubleTap={handleDoubleTapLike}
        burstKey={burstKey}
        ribbonBadge={ribbonBadge}
      />
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFlyToCartStore } from '@/shared/store/flyToCartStore';

const DOT_SIZE = 14;
const MORPH_MS = 200;   // button → dot
const FLIGHT_MS = 500;  // dot → cart
const TOTAL_MS = MORPH_MS + FLIGHT_MS;

/**
 * Animated dot that "forms" from the add-to-cart button and flies to the cart icon.
 *
 * Phase 1 (morph): starts as the button shape (same size, position, colors),
 *   shrinks into a small dot at the button's center.
 * Phase 2 (flight): the dot arcs along a parabolic path to the cart icon,
 *   shrinking and fading as it arrives.
 *
 * Mounted once in _app.tsx — purely visual, never touches cart logic.
 */
export function FlyToCartDot() {
  const source = useFlyToCartStore((s) => s.source);
  const clear = useFlyToCartStore((s) => s.clear);
  const dotRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!source || !dotRef.current) return;

    // Find the visible cart button (there may be 2: mobile + desktop)
    const targets = document.querySelectorAll<HTMLElement>('[data-fly-cart-target]');
    let target: HTMLElement | null = null;
    for (const el of targets) {
      if (el.offsetParent !== null || el.getClientRects().length > 0) {
        target = el;
        break;
      }
    }
    if (!target) {
      clear();
      return;
    }

    const targetRect = target.getBoundingClientRect();

    // Source: button center
    const srcCx = source.x + source.width / 2;
    const srcCy = source.y + source.height / 2;
    // Destination: cart icon center
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    // ── Phase 1: Morph (button pill → dot) ──
    // The element starts matching the button shape and contracts to a small circle
    const morphRatio = MORPH_MS / TOTAL_MS; // fraction of total timeline
    const startBg = source.bg ?? 'linear-gradient(135deg, #00C5D4, #009BAB)';

    const morphKeyframes: Keyframe[] = [
      {
        offset: 0,
        left: `${source.x}px`,
        top: `${source.y}px`,
        width: `${source.width}px`,
        height: `${source.height}px`,
        borderRadius: '9999px',
        background: startBg,
        boxShadow: '0 4px 12px rgba(0, 197, 212, 0.4)',
        opacity: 0.85,
      },
      {
        offset: morphRatio,
        left: `${srcCx - DOT_SIZE / 2}px`,
        top: `${srcCy - DOT_SIZE / 2}px`,
        width: `${DOT_SIZE}px`,
        height: `${DOT_SIZE}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #F0177A, #FF7A00)',
        boxShadow: '0 2px 8px rgba(240, 23, 122, 0.5)',
        opacity: 1,
      },
    ];

    // ── Phase 2: Flight (dot arcs to cart) ──
    // Parabolic control point — arcs above the midpoint
    const midX = (srcCx + endX) / 2;
    const arcHeight = Math.min(150, Math.abs(srcCy - endY) * 0.5 + 60);
    const cpY = Math.min(srcCy, endY) - arcHeight;

    const flightSteps = 16;
    const flightKeyframes: Keyframe[] = [];

    for (let i = 1; i <= flightSteps; i++) {
      const t = i / flightSteps; // 0→1 within flight phase
      const inv = 1 - t;
      // Quadratic bezier
      const px = inv * inv * srcCx + 2 * inv * t * midX + t * t * endX;
      const py = inv * inv * srcCy + 2 * inv * t * cpY + t * t * endY;

      const scale = 1 - t * 0.4;
      const opacity = t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25;
      const offset = morphRatio + (1 - morphRatio) * t;

      flightKeyframes.push({
        offset,
        left: `${px - DOT_SIZE / 2}px`,
        top: `${py - DOT_SIZE / 2}px`,
        width: `${DOT_SIZE}px`,
        height: `${DOT_SIZE}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #F0177A, #FF7A00)',
        boxShadow: '0 2px 8px rgba(240, 23, 122, 0.5)',
        transform: `scale(${scale})`,
        opacity,
      });
    }

    const allKeyframes = [...morphKeyframes, ...flightKeyframes];

    const dot = dotRef.current;
    dot.style.display = 'block';

    const anim = dot.animate(allKeyframes, {
      duration: TOTAL_MS,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
    });

    anim.onfinish = () => {
      dot.style.display = 'none';
      clear();
    };

    return () => {
      anim.cancel();
      dot.style.display = 'none';
    };
  }, [source, clear]);

  // Respect reduced motion
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!mounted || prefersReduced) return null;

  return createPortal(
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        display: 'none',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />,
    document.body,
  );
}

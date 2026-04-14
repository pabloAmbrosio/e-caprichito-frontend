import { useEffect } from 'react';
import { useRouter } from 'next/router';

type DocWithTransition = Document & {
  startViewTransition?: (callback: () => Promise<void> | void) => void;
};

/**
 * Hooks into Next.js Pages Router events to trigger the native
 * View Transitions API on every page navigation.
 *
 * Behavior by page speed:
 * - Fast (cached ISR, < 100ms): seamless hero animation, no perceptible freeze
 * - Slow (first ISR generation): waits for server → same wait as without transitions,
 *   but the old page is visually frozen during that time
 *
 * Falls back gracefully in browsers without View Transitions support.
 */
export function usePageViewTransition() {
  const router = useRouter();

  useEffect(() => {
    const doc = document as DocWithTransition;
    if (!doc.startViewTransition) return;

    let resolveTransition: (() => void) | null = null;
    // True when routeChangeComplete fired before the startViewTransition
    // callback had a chance to run (happens with fast cached ISR pages).
    let settled = false;

    // Wait two animation frames before resolving so the browser completes
    // layout + paint for the new page before the "after" snapshot is taken.
    // Without this, the snapshot can capture the new DOM with stale positions.
    const resolveAfterPaint = (resolve: () => void) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    };

    const settle = () => {
      settled = true;
      if (resolveTransition) {
        const resolve = resolveTransition;
        resolveTransition = null;
        resolveAfterPaint(resolve);
      }
    };

    const handleStart = () => {
      const d = document as DocWithTransition;
      if (!d.startViewTransition) return;

      settled = false;
      resolveTransition = null;

      d.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            if (settled) {
              // Fast path: routeChangeComplete already fired — wait for paint
              // then resolve so the "after" snapshot sees the fully-laid-out page.
              resolveAfterPaint(resolve);
            } else {
              resolveTransition = resolve;
            }
          })
      );
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', settle);
    router.events.on('routeChangeError', settle);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', settle);
      router.events.off('routeChangeError', settle);
      settle(); // clean up any pending transition on unmount
    };
  }, [router.events]);
}

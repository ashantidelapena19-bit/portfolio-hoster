import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import Lenis from 'lenis';
import { MotionConfig } from 'motion/react';

interface ScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
}

interface AntigravityScrollContextValue {
  scrollTo: (
    target: string | number | HTMLElement,
    options?: ScrollToOptions
  ) => void;
  pauseScroll: () => void;
  resumeScroll: () => void;
}

const AntigravityScrollContext = createContext<AntigravityScrollContextValue>({
  scrollTo: () => {},
  pauseScroll: () => {},
  resumeScroll: () => {},
});

export const useAntigravityScroll = () => useContext(AntigravityScrollContext);

// Smooth exponential deceleration curve matching Antigravity's weightless glide
const antigravityEase = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const AntigravityScrollProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const pauseDepthRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.068,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.4,
      easing: antigravityEase,
    });

    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Intercept internal anchor links for damped inertia anchor navigation
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      const el =
        hash === '#top'
          ? (document.getElementById('top') ?? document.documentElement)
          : document.querySelector<HTMLElement>(hash);

      if (!el) return;
      event.preventDefault();

      lenis.scrollTo(hash === '#top' ? 0 : el, {
        offset: hash === '#top' ? 0 : -76,
        duration: 1.25,
        easing: antigravityEase,
      });
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, options?: ScrollToOptions) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, {
          offset: options?.offset ?? -76,
          duration: options?.duration ?? 1.2,
          immediate: options?.immediate ?? false,
          easing: antigravityEase,
        });
        return;
      }

      // Reduced-motion / fallback path
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'auto' });
      } else if (typeof target === 'string') {
        const el = document.querySelector<HTMLElement>(target);
        el?.scrollIntoView({ behavior: 'auto' });
      } else {
        target.scrollIntoView({ behavior: 'auto' });
      }
    },
    []
  );

  const pauseScroll = useCallback(() => {
    pauseDepthRef.current += 1;
    lenisRef.current?.stop();
  }, []);

  const resumeScroll = useCallback(() => {
    pauseDepthRef.current = Math.max(0, pauseDepthRef.current - 1);
    if (pauseDepthRef.current === 0) {
      lenisRef.current?.start();
    }
  }, []);

  const value = useMemo(
    () => ({ scrollTo, pauseScroll, resumeScroll }),
    [scrollTo, pauseScroll, resumeScroll]
  );

  return (
    <AntigravityScrollContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </AntigravityScrollContext.Provider>
  );
};

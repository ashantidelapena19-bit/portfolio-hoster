import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'motion/react';

interface NavbarProps {
  onOpenRoster: () => void;
}

const NAV_ITEMS = [
  { id: 'gallery', href: '#gallery', label: 'Gallery' },
  { id: 'tech-stack', href: '#tech-stack', label: 'Tech Stack' },
  { id: 'contributors', href: '#contributors', label: 'Contributors' },
  { id: 'structure', href: '#structure', label: 'Site Map' },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]['id'];

const ANTIGRAVITY_EASE = [0.22, 1, 0.36, 1] as const;

export const Navbar: React.FC<NavbarProps> = ({ onOpenRoster }) => {
  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  const [isTransparentMode, setIsTransparentMode] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const lastScrollYRef = useRef(0);

  const computeActiveSection = useCallback(() => {
    const activationLine = Math.min(window.innerHeight * 0.32, 220);

    // If user is at the bottom of the page, highlight the final section
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 24;
    if (atBottom) {
      setActiveSection('structure');
      return;
    }

    let current: SectionId | null = null;
    for (const item of NAV_ITEMS) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= activationLine) {
        current = item.id;
      }
    }
    setActiveSection(current);
  }, []);

  useEffect(() => {
    computeActiveSection();
    window.addEventListener('resize', computeActiveSection, { passive: true });
    return () => window.removeEventListener('resize', computeActiveSection);
  }, [computeActiveSection]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    computeActiveSection();

    if (latest <= 28) {
      setIsTransparentMode(false);
      lastScrollYRef.current = latest;
      return;
    }

    const delta = latest - lastScrollYRef.current;
    if (Math.abs(delta) < 4) return;

    if (delta > 0 && latest > 48) {
      setIsTransparentMode(true);
    } else if (delta < 0) {
      setIsTransparentMode(false);
    }

    lastScrollYRef.current = latest;
  });

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ease-out motion-reduce:transition-none ${
        isTransparentMode
          ? 'bg-transparent backdrop-blur-none border-b border-transparent'
          : 'bg-[var(--p-header-bg)] backdrop-blur-md border-b border-[var(--p-border)]'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="text-[20px] font-extrabold tracking-tight text-[var(--p-ink)] whitespace-nowrap shrink-0 font-[family-name:var(--font-display)]"
        >
          SE Class A
        </a>

        {/* Zone 2: 4 Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8 text-[14px] font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isHighlighted = isTransparentMode && activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                aria-current={isHighlighted ? 'location' : undefined}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-all duration-200 ${
                  isTransparentMode
                    ? isHighlighted
                      ? 'text-[var(--p-ink)] font-semibold opacity-100'
                      : 'text-[var(--p-ink-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--p-ink)]'
                    : 'text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] hover:underline underline-offset-4 decoration-[var(--p-accent)]'
                }`}
              >
                <span>{item.label}</span>
                <AnimatePresence>
                  {isHighlighted && (
                    <motion.span
                      layoutId="navbar-active-section"
                      initial={{ opacity: 0, scaleX: 0.6 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.6 }}
                      transition={{ duration: 0.25, ease: ANTIGRAVITY_EASE }}
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-[var(--p-accent)] origin-center"
                    />
                  )}
                </AnimatePresence>
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenRoster}
            className="px-5 py-2.5 rounded-full bg-[var(--p-action)] text-[var(--p-action-ink)] text-[13px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]"
          >
            Student Sites
          </button>
        </div>
      </div>

      {/* Damped Antigravity scroll progress hairline */}
      <motion.div
        aria-hidden="true"
        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--p-accent)]/85 origin-left pointer-events-none transition-opacity duration-300 ${
          isTransparentMode ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ scaleX: smoothProgress }}
      />
    </header>
  );
};

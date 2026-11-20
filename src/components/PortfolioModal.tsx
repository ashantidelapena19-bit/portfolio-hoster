import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { StudentPortfolio } from '../data/portfolios';
import { useAntigravityScroll } from './AntigravityScrollProvider';

interface PortfolioModalProps {
  portfolio: StudentPortfolio | null;
  allPortfolios: StudentPortfolio[];
  onClose: () => void;
  onNavigate: (portfolio: StudentPortfolio) => void;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

const ANTIGRAVITY_EASE = [0.22, 1, 0.36, 1] as const;

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  portfolio,
  allPortfolios,
  onClose,
  onNavigate,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const { pauseScroll, resumeScroll } = useAntigravityScroll();

  useEffect(() => {
    if (!portfolio) return;
    pauseScroll();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      resumeScroll();
    };
  }, [portfolio, onClose, pauseScroll, resumeScroll]);

  const currentIdx = portfolio
    ? allPortfolios.findIndex((p) => p.id === portfolio.id)
    : -1;
  const prevItem =
    allPortfolios[(currentIdx - 1 + allPortfolios.length) % allPortfolios.length];
  const nextItem = allPortfolios[(currentIdx + 1) % allPortfolios.length];

  const frameWidthClass =
    viewport === 'mobile'
      ? 'w-[390px] max-w-full'
      : viewport === 'tablet'
        ? 'w-[820px] max-w-full'
        : 'w-full';

  return (
    <AnimatePresence>
      {portfolio && (
        <motion.div
          key="portfolio-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${portfolio.studentName} standalone portfolio preview`}
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: ANTIGRAVITY_EASE }}
          className="fixed inset-0 z-50 bg-[var(--p-backdrop)] backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
          onClick={onClose}
        >
          <motion.div
            key="portfolio-modal-panel"
            initial={{ opacity: 0, y: 22, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.99 }}
            transition={{ duration: 0.36, ease: ANTIGRAVITY_EASE }}
            className="w-full max-w-[1360px] h-[92vh] bg-[var(--p-surface-elevated)] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-[var(--p-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Inspector Bar */}
            <div className="px-4 md:px-6 py-3.5 border-b border-[var(--p-border)] flex items-center justify-between gap-4 bg-[var(--p-surface-elevated)] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: portfolio.avatarColor }}
                >
                  {portfolio.initials}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-[var(--p-ink)] truncate">
                      {portfolio.studentName}
                    </h2>
                    <span className="text-[12px] text-[var(--p-muted)] hidden sm:inline whitespace-nowrap">
                      · {portfolio.roleTitle}
                    </span>
                  </div>
                  <p className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--p-muted)] truncate">
                    student-portfolios/{portfolio.folderName}/index.html
                  </p>
                </div>
              </div>

              {/* Responsive Viewport Switcher */}
              <div className="hidden md:flex items-center gap-1 p-1 bg-[var(--p-surface)] rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setViewport('desktop')}
                  aria-label="Desktop view"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewport === 'desktop'
                      ? 'bg-[var(--p-surface-elevated)] text-[var(--p-ink)] shadow-sm'
                      : 'text-[var(--p-muted)] hover:text-[var(--p-ink)]'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('tablet')}
                  aria-label="Tablet view"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewport === 'tablet'
                      ? 'bg-[var(--p-surface-elevated)] text-[var(--p-ink)] shadow-sm'
                      : 'text-[var(--p-muted)] hover:text-[var(--p-ink)]'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  aria-label="Mobile view"
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewport === 'mobile'
                      ? 'bg-[var(--p-surface-elevated)] text-[var(--p-ink)] shadow-sm'
                      : 'text-[var(--p-muted)] hover:text-[var(--p-ink)]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              {/* Standalone Open & Close */}
              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href={portfolio.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-[var(--p-accent)] text-[var(--p-accent-ink)] text-[13px] font-semibold hover:bg-[var(--p-accent-hover)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Open Standalone Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close preview modal"
                  className="w-9 h-9 rounded-lg border border-[var(--p-border)] text-[var(--p-ink)] hover:bg-[var(--p-surface)] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Student Website Iframe */}
            <div className="flex-1 bg-[var(--p-surface)] overflow-hidden flex justify-center p-0 md:p-4">
              <div
                className={`${frameWidthClass} h-full bg-white md:rounded-xl overflow-hidden border border-[var(--p-border)] shadow-sm transition-all duration-200`}
              >
                <iframe
                  key={portfolio.id}
                  src={portfolio.portfolioUrl}
                  title={`${portfolio.studentName} Portfolio Website`}
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>

            {/* Bottom Prev/Next Cohort Strip */}
            <div className="px-4 md:px-6 py-2.5 border-t border-[var(--p-border)] bg-[var(--p-surface-elevated)] flex items-center justify-between gap-4 text-[13px] shrink-0">
              <button
                type="button"
                onClick={() => onNavigate(prevItem)}
                className="inline-flex items-center gap-1.5 text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] font-medium cursor-pointer truncate"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">Previous: {prevItem.studentName}</span>
              </button>
              <span className="text-[12px] text-[var(--p-muted)] font-[family-name:var(--font-mono)] tabular-nums hidden sm:inline">
                {currentIdx + 1} / {allPortfolios.length}
              </span>
              <button
                type="button"
                onClick={() => onNavigate(nextItem)}
                className="inline-flex items-center gap-1.5 text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] font-medium cursor-pointer truncate"
              >
                <span className="truncate">Next: {nextItem.studentName}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

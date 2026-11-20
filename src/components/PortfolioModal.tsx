import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  LayoutTemplate,
  Monitor,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { StudentPortfolio } from '../data/portfolios';
import { useAntigravityScroll } from './AntigravityScrollProvider';
import { SocialLinksBar } from './SocialLinksBar';

interface PortfolioModalProps {
  portfolio: StudentPortfolio | null;
  allPortfolios: StudentPortfolio[];
  onClose: () => void;
  onNavigate: (portfolio: StudentPortfolio) => void;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type InspectorTab = 'site' | 'showcase';

const ANTIGRAVITY_EASE = [0.22, 1, 0.36, 1] as const;

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  portfolio,
  allPortfolios,
  onClose,
  onNavigate,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [tab, setTab] = useState<InspectorTab>('site');
  const { pauseScroll, resumeScroll } = useAntigravityScroll();

  useEffect(() => {
    if (!portfolio) return;
    setTab(portfolio.portfolioUrl ? (portfolio.isPublishedCommunity ? 'showcase' : 'site') : 'showcase');
  }, [portfolio]);

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

  const hasLiveSite = Boolean(portfolio?.portfolioUrl);

  return (
    <AnimatePresence>
      {portfolio && (
        <motion.div
          key="portfolio-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${portfolio.studentName} portfolio preview`}
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
                  className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: portfolio.avatarColor }}
                >
                  {portfolio.avatarUrl ? (
                    <img
                      src={portfolio.avatarUrl}
                      alt={portfolio.studentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    portfolio.initials
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-[var(--p-ink)] truncate">
                      {portfolio.studentName}
                    </h2>
                    {portfolio.username && (
                      <span className="text-[12px] text-[var(--p-muted)] hidden sm:inline whitespace-nowrap">
                        @{portfolio.username}
                      </span>
                    )}
                    <span className="text-[12px] text-[var(--p-muted)] hidden md:inline whitespace-nowrap">
                      · {portfolio.roleTitle}
                    </span>
                  </div>
                  <p className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--p-muted)] truncate">
                    {portfolio.isPublishedCommunity
                      ? `${portfolio.discipline} · Published Profile`
                      : `student-portfolios/${portfolio.folderName}/index.html`}
                  </p>
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                {hasLiveSite && (
                  <div className="flex items-center gap-1 p-1 bg-[var(--p-surface)] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setTab('showcase')}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                        tab === 'showcase'
                          ? 'bg-[var(--p-surface-elevated)] text-[var(--p-ink)] shadow-sm'
                          : 'text-[var(--p-muted)] hover:text-[var(--p-ink)]'
                      }`}
                    >
                      <LayoutTemplate className="w-3.5 h-3.5" />
                      <span>Showcase</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('site')}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                        tab === 'site'
                          ? 'bg-[var(--p-surface-elevated)] text-[var(--p-ink)] shadow-sm'
                          : 'text-[var(--p-muted)] hover:text-[var(--p-ink)]'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Live Site</span>
                    </button>
                  </div>
                )}

                {hasLiveSite && tab === 'site' && (
                  <div className="flex items-center gap-1 p-1 bg-[var(--p-surface)] rounded-lg">
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
                )}
              </div>

              {/* Standalone Open & Close */}
              <div className="flex items-center gap-2.5 shrink-0">
                {hasLiveSite && (
                  <a
                    href={portfolio.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-[var(--p-accent)] text-[var(--p-accent-ink)] text-[13px] font-semibold hover:bg-[var(--p-accent-hover)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Open Standalone Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
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

            {/* Body: Either Embedded Iframe or Editorial Showcase View */}
            {hasLiveSite && tab === 'site' ? (
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
            ) : (
              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto bg-[var(--p-bg)] p-6 md:p-10"
              >
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Cover Media */}
                  <div className="lg:col-span-7">
                    <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[var(--p-border)] bg-[var(--p-surface)]">
                      {portfolio.thumbnail ? (
                        <img
                          src={portfolio.thumbnail}
                          alt={portfolio.projectTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${portfolio.fallbackGradient} flex flex-col items-center justify-center p-8 text-center`}
                        >
                          <Layers className="w-10 h-10 text-white/80 mb-3" />
                          <span className="text-[18px] font-bold text-white">
                            {portfolio.projectTitle}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile & Description Details */}
                  <div className="lg:col-span-5 space-y-5">
                    <div className="flex items-center gap-3.5">
                      <span
                        className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-base font-bold text-white shrink-0"
                        style={{ backgroundColor: portfolio.avatarColor }}
                      >
                        {portfolio.avatarUrl ? (
                          <img
                            src={portfolio.avatarUrl}
                            alt={portfolio.studentName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          portfolio.initials
                        )}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[20px] font-bold text-[var(--p-ink)] truncate">
                          {portfolio.studentName}
                        </h3>
                        <p className="text-[13px] text-[var(--p-muted)] truncate">
                          {portfolio.username ? `@${portfolio.username} · ` : ''}
                          {portfolio.roleTitle}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--p-muted)]">
                        {portfolio.discipline}
                      </div>
                      <h4 className="text-[22px] font-bold tracking-tight text-[var(--p-ink)] leading-snug">
                        {portfolio.projectTitle}
                      </h4>
                      <p className="text-[14px] text-[var(--p-ink-secondary)] leading-relaxed">
                        {portfolio.projectSummary}
                      </p>
                    </div>

                    {portfolio.bio && portfolio.bio !== portfolio.projectSummary && (
                      <div className="p-4 rounded-xl border border-[var(--p-border)] bg-[var(--p-surface-subtle)]">
                        <p className="text-[12px] font-semibold text-[var(--p-muted)] mb-1">
                          About {portfolio.firstName}
                        </p>
                        <p className="text-[13px] text-[var(--p-ink-secondary)] leading-relaxed">
                          {portfolio.bio}
                        </p>
                      </div>
                    )}

                    {portfolio.skills.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[12px] font-semibold text-[var(--p-muted)]">
                          Technical Stack
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {portfolio.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-md border border-[var(--p-border)] bg-[var(--p-surface-subtle)] text-[12px] font-medium text-[var(--p-ink)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {portfolio.socialLinks && (
                      <div className="pt-2 space-y-2">
                        <p className="text-[12px] font-semibold text-[var(--p-muted)]">
                          Social & Contact Accounts
                        </p>
                        <SocialLinksBar
                          links={portfolio.socialLinks}
                          size="md"
                          showLabels
                        />
                      </div>
                    )}

                    {hasLiveSite && (
                      <div className="pt-2">
                        <a
                          href={portfolio.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-11 px-4 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[13px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <span>Visit External Portfolio Site</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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

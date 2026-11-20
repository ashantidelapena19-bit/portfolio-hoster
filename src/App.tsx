import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Palette, Search, X } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';
import {
  AntigravityScrollProvider,
  useAntigravityScroll,
} from './components/AntigravityScrollProvider';
import { ColorSchemeDrawer } from './components/ColorSchemeDrawer';
import { Navbar } from './components/Navbar';
import { PortfolioModal } from './components/PortfolioModal';
import { ShotCard } from './components/ShotCard';
import { SkillsAndContributors } from './components/SkillsAndContributors';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import {
  STUDENT_PORTFOLIOS,
  StudentPortfolio,
} from './data/portfolios';

type SortOption = 'popular' | 'views' | 'roll';

const ANTIGRAVITY_EASE = [0.22, 1, 0.36, 1] as const;

function GalleryExperience() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [activePortfolio, setActivePortfolio] = useState<StudentPortfolio | null>(null);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { pauseScroll, resumeScroll } = useAntigravityScroll();
  const { activeScheme, tokens } = useTheme();

  useEffect(() => {
    if (!rosterOpen) return;
    pauseScroll();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRosterOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      resumeScroll();
    };
  }, [rosterOpen, pauseScroll, resumeScroll]);

  // Global scroll velocity for weightless per-column lag (settles back to 0 when stopped)
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const clampedVelocity = useTransform(scrollVelocity, [-1800, 1800], [18, -18], {
    clamp: true,
  });

  const col0Lag = useSpring(
    useTransform(clampedVelocity, (v) => v * 0.35),
    { stiffness: 150, damping: 24, mass: 0.65 }
  );
  const col1Lag = useSpring(
    useTransform(clampedVelocity, (v) => v * 0.9),
    { stiffness: 92, damping: 20, mass: 1.05 }
  );
  const col2Lag = useSpring(
    useTransform(clampedVelocity, (v) => v * 0.58),
    { stiffness: 118, damping: 22, mass: 0.85 }
  );
  const columnLags = [col0Lag, col1Lag, col2Lag];

  // Subtle delayed parallax on hero header as user scrolls into the gallery
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const smoothHeroProgress = useSpring(heroScrollProgress, {
    stiffness: 100,
    damping: 26,
    restDelta: 0.001,
  });
  const heroY = useTransform(smoothHeroProgress, [0, 1], [0, 32]);
  const heroOpacity = useTransform(smoothHeroProgress, [0, 0.85], [1, 0.35]);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPortfolios = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = STUDENT_PORTFOLIOS.filter((item) => {
      if (selectedSkill && !item.skills.includes(selectedSkill)) {
        return false;
      }
      if (!q) return true;
      return (
        item.studentName.toLowerCase().includes(q) ||
        item.projectTitle.toLowerCase().includes(q) ||
        item.roleTitle.toLowerCase().includes(q) ||
        item.discipline.toLowerCase().includes(q) ||
        item.skills.some((s) => s.toLowerCase().includes(q))
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'popular') {
        const likesA = a.likes + (likedIds[a.id] ? 1 : 0);
        const likesB = b.likes + (likedIds[b.id] ? 1 : 0);
        return likesB - likesA;
      }
      if (sortBy === 'views') {
        return b.views - a.views;
      }
      return a.rollNumber.localeCompare(b.rollNumber);
    });
  }, [searchQuery, selectedSkill, sortBy, likedIds]);

  const totalViews = useMemo(
    () => STUDENT_PORTFOLIOS.reduce((acc, p) => acc + p.views, 0),
    []
  );

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[var(--p-bg)] text-[var(--p-ink)] transition-colors duration-200">
      <Navbar onOpenRoster={() => setRosterOpen(true)} />

      {/* Editorial Dribbble-Inspired Hero + Search with Antigravity Entrance & Parallax */}
      <section
        ref={heroRef}
        className="pt-10 pb-8 md:pt-14 md:pb-10 px-6 md:px-10 max-w-[1360px] w-full mx-auto"
      >
        <motion.div
          style={shouldReduceMotion ? undefined : { y: heroY, opacity: heroOpacity }}
          className="max-w-3xl mx-auto text-center will-change-transform"
        >
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.04, ease: ANTIGRAVITY_EASE }}
            className="text-[13px] font-medium text-[var(--p-muted)] mb-3"
          >
            2026 Cohort Showcase · {STUDENT_PORTFOLIOS.length} Standalone Student Sites ·{' '}
            <span className="tabular-nums">{totalViews.toLocaleString()}</span> Portfolio Views
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.11, ease: ANTIGRAVITY_EASE }}
            className="text-[clamp(2.1rem,4vw,3.35rem)] font-bold tracking-tight leading-[1.1] text-[var(--p-ink)] text-balance"
          >
            Software Engineering{' '}
            <span className="font-[family-name:var(--font-serif-editorial)] italic font-medium">
              Class A
            </span>{' '}
            Portfolio Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.18, ease: ANTIGRAVITY_EASE }}
            className="text-[15px] md:text-[16px] text-[var(--p-muted)] mt-3.5 max-w-2xl mx-auto leading-relaxed"
          >
            Explore capstone projects, technical stacks, and open each student’s individual portfolio website directly inside the gallery.
          </motion.p>

          {/* Dribbble-style Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.25, ease: ANTIGRAVITY_EASE }}
            onSubmit={(e) => e.preventDefault()}
            className="mt-7 max-w-[660px] mx-auto relative flex items-center bg-[var(--p-surface)] border border-transparent focus-within:bg-[var(--p-surface-elevated)] focus-within:border-[var(--p-accent)]/50 focus-within:ring-4 focus-within:ring-[var(--p-accent)]/15 rounded-full p-1.5 pl-5 transition-all"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What student, project, or skill are you looking for?"
              aria-label="Search student portfolios"
              className="w-full bg-transparent text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none pr-3"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="p-2 text-[var(--p-muted)] hover:text-[var(--p-ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Search"
              className="w-10 h-10 rounded-full bg-[var(--p-accent)] hover:bg-[var(--p-accent-hover)] text-[var(--p-accent-ink)] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </motion.form>
        </motion.div>
      </section>

      {/* Controls Strip */}
      <section
        id="gallery"
        className="max-w-[1360px] w-full mx-auto px-6 md:px-10 pb-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease: ANTIGRAVITY_EASE }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7"
        >
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--p-muted)] tabular-nums">
              {filteredPortfolios.length} of {STUDENT_PORTFOLIOS.length} Portfolios
            </span>
            {selectedSkill && (
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--p-border)] text-[12px] font-medium text-[var(--p-ink)] hover:bg-[var(--p-surface)] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Skill: {selectedSkill}</span>
                <X className="w-3.5 h-3.5 text-[var(--p-muted)]" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 flex-wrap">

            <button
              type="button"
              onClick={() => setThemeDrawerOpen(true)}
              aria-label={`Open color schemes organizer (Current: ${activeScheme.name})`}
              className="px-3.5 py-2 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] hover:border-[var(--p-border-strong)] text-[13px] font-medium text-[var(--p-ink)] inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--p-accent)]"
            >
              <span
                className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                style={{ backgroundColor: tokens.accent }}
                aria-hidden="true"
              />
              <Palette className="w-3.5 h-3.5 text-[var(--p-muted)]" />
              <span>Color Schemes</span>
            </button>

            <label className="sr-only" htmlFor="sort-select">
              Sort portfolios
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3.5 py-2 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] text-[13px] font-medium text-[var(--p-ink)] focus:outline-none focus:border-[var(--p-ink)] cursor-pointer"
            >
              <option value="popular">Popular</option>
              <option value="views">Most Viewed</option>
              <option value="roll">Roll Number (A–Z)</option>
            </select>
          </div>
        </motion.div>

        {/* Dribbble 3-Column Portfolio Gallery Grid */}
        {filteredPortfolios.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-9 gap-y-10">
            {filteredPortfolios.map((item, idx) => (
              <ShotCard
                key={item.id}
                item={item}
                index={idx}
                columnLagY={columnLags[idx % 3]}
                isLiked={Boolean(likedIds[item.id])}
                onToggleLike={toggleLike}
                onSelectPortfolio={setActivePortfolio}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-[var(--p-border)] rounded-2xl bg-[var(--p-surface-subtle)]">
            <p className="text-[16px] font-semibold text-[var(--p-ink)]">
              No matching student portfolios found
            </p>
            <p className="text-[14px] text-[var(--p-muted)] mt-1">
              Try clearing your search query or resetting the active skill filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSkill(null);
              }}
              className="mt-4 px-5 py-2.5 rounded-full bg-[var(--p-action)] text-[var(--p-action-ink)] text-[13px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      <SkillsAndContributors
        portfolios={STUDENT_PORTFOLIOS}
        selectedSkill={selectedSkill}
        onSelectSkill={setSelectedSkill}
        onSelectPortfolio={setActivePortfolio}
      />

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[var(--p-border)] bg-[var(--p-bg)] py-10 transition-colors duration-200">
        <div className="max-w-[1360px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[var(--p-muted)]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--p-ink)]">SE Class A</span>
            <span>·</span>
            <span>Software Engineering Cohort Showcase 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="/student-portfolios/Bond%20Portfolio/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--p-ink)] transition-colors"
            >
              Bond Portfolio
            </a>
            <a
              href="/student-portfolios/Smith%20Portfolio/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--p-ink)] transition-colors"
            >
              Smith Portfolio
            </a>
            <button
              type="button"
              onClick={() => setThemeDrawerOpen(true)}
              className="hover:text-[var(--p-ink)] transition-colors cursor-pointer"
            >
              Color Schemes
            </button>
            <button
              type="button"
              onClick={() => setRosterOpen(true)}
              className="hover:text-[var(--p-ink)] transition-colors cursor-pointer"
            >
              All 9 Sites
            </button>
          </div>
        </div>
      </footer>

      {/* Embedded Standalone Website Preview Modal */}
      <PortfolioModal
        portfolio={activePortfolio}
        allPortfolios={STUDENT_PORTFOLIOS}
        onClose={() => setActivePortfolio(null)}
        onNavigate={(next) => setActivePortfolio(next)}
      />

      {/* Color Scheme & Semantic Token Organizer Drawer */}
      <ColorSchemeDrawer
        open={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
      />

      {/* Quick Student Sites Roster Drawer / Modal */}
      <AnimatePresence>
        {rosterOpen && (
          <motion.div
            key="roster-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Class A student websites directory"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: ANTIGRAVITY_EASE }}
            className="fixed inset-0 z-50 bg-[var(--p-backdrop)] backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setRosterOpen(false)}
          >
            <motion.div
              key="roster-modal-panel"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.99 }}
              transition={{ duration: 0.32, ease: ANTIGRAVITY_EASE }}
              className="w-full max-w-2xl bg-[var(--p-surface-elevated)] rounded-2xl border border-[var(--p-border)] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[var(--p-border)] flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-bold text-[var(--p-ink)]">
                    Software Engineering Class A — Student Sites
                  </h2>
                  <p className="text-[13px] text-[var(--p-muted)]">
                    Launch any student’s standalone portfolio website inside the viewer or in a new tab.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRosterOpen(false)}
                  aria-label="Close roster"
                  className="w-8 h-8 rounded-lg border border-[var(--p-border)] text-[var(--p-ink)] flex items-center justify-center hover:bg-[var(--p-surface)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                data-lenis-prevent
                className="divide-y divide-[var(--p-border)] max-h-[65vh] overflow-y-auto"
              >
                {STUDENT_PORTFOLIOS.map((student) => (
                  <div
                    key={student.id}
                    className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--p-surface-subtle)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: student.avatarColor }}
                      >
                        {student.initials}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-[var(--p-ink)] truncate">
                          {student.studentName}
                        </div>
                        <div className="text-[12px] font-[family-name:var(--font-mono)] text-[var(--p-muted)] truncate">
                          student-portfolios/{student.folderName}/index.html
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setRosterOpen(false);
                          setActivePortfolio(student);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[12px] font-semibold hover:bg-[var(--p-action-hover)] cursor-pointer"
                      >
                        Preview
                      </button>
                      <a
                        href={student.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-[var(--p-border)] text-[var(--p-ink)] text-[12px] font-medium hover:bg-[var(--p-surface)] inline-flex items-center gap-1"
                      >
                        <span>Visit</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AntigravityScrollProvider>
        <GalleryExperience />
      </AntigravityScrollProvider>
    </ThemeProvider>
  );
}

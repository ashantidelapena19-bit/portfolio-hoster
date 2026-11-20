import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LogIn,
  LogOut,
  RefreshCw,
  User,
  UserCog,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'motion/react';
import { AuthSession } from '../lib/supabase';

interface NavbarProps {
  session: AuthSession | null;
  onNavigateLogin: () => void;
  onNavigateProfile: () => void;
  onSwitchAccount: () => Promise<void>;
  onLogout: () => Promise<void>;
}

const NAV_ITEMS = [
  { id: 'gallery', href: '#gallery', label: 'Gallery' },
  { id: 'tech-stack', href: '#tech-stack', label: 'Tech Stack' },
  { id: 'contributors', href: '#contributors', label: 'Contributors' },
  { id: 'structure', href: '#structure', label: 'Site Map' },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]['id'];

const ANTIGRAVITY_EASE = [0.22, 1, 0.36, 1] as const;

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onNavigateLogin,
  onNavigateProfile,
  onSwitchAccount,
  onLogout,
}) => {
  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  const [isTransparentMode, setIsTransparentMode] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const computeActiveSection = useCallback(() => {
    const activationLine = Math.min(window.innerHeight * 0.32, 220);

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

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

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
      setMenuOpen(false);
    } else if (delta < 0) {
      setIsTransparentMode(false);
    }

    lastScrollYRef.current = latest;
  });

  const authLinkLabel =
    session?.mode === 'authenticated'
      ? 'Account'
      : session?.mode === 'guest'
        ? 'Guest'
        : 'Login';

  const initials =
    session?.displayName
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '';

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
          aria-hidden={isTransparentMode}
          tabIndex={isTransparentMode ? -1 : undefined}
          className={`text-[20px] font-extrabold tracking-tight text-[var(--p-ink)] whitespace-nowrap shrink-0 font-[family-name:var(--font-display)] transition-opacity duration-200 ${
            isTransparentMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          SE Class A
        </a>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8 text-[14px] font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isHighlighted = isTransparentMode && activeSection === item.id;
            const isHiddenOnScroll = isTransparentMode && !isHighlighted;
            return (
              <a
                key={item.id}
                href={item.href}
                aria-current={isHighlighted ? 'location' : undefined}
                aria-hidden={isHiddenOnScroll}
                tabIndex={isHiddenOnScroll ? -1 : undefined}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-all duration-200 ${
                  isTransparentMode
                    ? isHighlighted
                      ? 'text-[var(--p-ink)] font-semibold opacity-100'
                      : 'text-[var(--p-ink)] opacity-0 pointer-events-none'
                    : 'text-[var(--p-ink-secondary)] opacity-100 hover:text-[var(--p-ink)] hover:underline underline-offset-4 decoration-[var(--p-accent)]'
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
          <a
            href="/login"
            aria-hidden={isTransparentMode}
            tabIndex={isTransparentMode ? -1 : undefined}
            onClick={(e) => {
              e.preventDefault();
              onNavigateLogin();
            }}
            className={`relative py-1 whitespace-nowrap shrink-0 transition-all duration-200 ${
              isTransparentMode
                ? 'text-[var(--p-ink)] opacity-0 pointer-events-none'
                : 'text-[var(--p-ink-secondary)] opacity-100 hover:text-[var(--p-ink)] hover:underline underline-offset-4 decoration-[var(--p-accent)]'
            }`}
          >
            {authLinkLabel}
          </a>
        </nav>

        {/* Zone 3: Profile Icon & Account Menu */}
        <div
          ref={menuContainerRef}
          aria-hidden={isTransparentMode}
          className={`relative shrink-0 transition-opacity duration-200 ${
            isTransparentMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <button
            type="button"
            tabIndex={isTransparentMode ? -1 : undefined}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="w-10 h-10 rounded-full border border-[var(--p-border)] bg-[var(--p-surface-elevated)] hover:border-[var(--p-border-strong)] text-[var(--p-ink)] flex items-center justify-center overflow-hidden transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]"
          >
            {session?.mode === 'authenticated' && session.avatarUrl ? (
              <img
                src={session.avatarUrl}
                alt={session.displayName}
                className="w-full h-full object-cover"
              />
            ) : session?.mode === 'authenticated' && initials ? (
              <span className="w-full h-full bg-[var(--p-accent)] text-[var(--p-accent-ink)] text-[12px] font-bold flex items-center justify-center">
                {initials}
              </span>
            ) : (
              <User className="w-4 h-4 text-[var(--p-ink)]" />
            )}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                role="menu"
                aria-label="Profile options"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.16, ease: ANTIGRAVITY_EASE }}
                className="absolute right-0 mt-2.5 w-64 rounded-xl border border-[var(--p-border)] bg-[var(--p-surface-elevated)] shadow-xl overflow-hidden z-50"
              >
                {/* Account Header */}
                <div className="px-4 py-3 border-b border-[var(--p-border)] bg-[var(--p-surface-subtle)]">
                  {session?.mode === 'authenticated' ? (
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[var(--p-ink)] truncate">
                        {session.displayName}
                      </p>
                      <p className="text-[12px] text-[var(--p-muted)] truncate">
                        {session.username ? `@${session.username} · ` : ''}
                        {session.email}
                      </p>
                    </div>
                  ) : session?.mode === 'guest' ? (
                    <div>
                      <p className="text-[13px] font-bold text-[var(--p-ink)]">
                        Guest Visitor
                      </p>
                      <p className="text-[12px] text-[var(--p-muted)]">
                        Sign in to publish your portfolio
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[13px] font-bold text-[var(--p-ink)]">
                        Not signed in
                      </p>
                      <p className="text-[12px] text-[var(--p-muted)]">
                        Sign in to edit and publish your profile
                      </p>
                    </div>
                  )}
                </div>

                {/* Menu Actions */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigateProfile();
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-[13px] font-medium text-[var(--p-ink)] hover:bg-[var(--p-surface)] transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <UserCog className="w-4 h-4 text-[var(--p-muted)] shrink-0" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      void onSwitchAccount();
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-[13px] font-medium text-[var(--p-ink)] hover:bg-[var(--p-surface)] transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-[var(--p-muted)] shrink-0" />
                    <span>Switch Account</span>
                  </button>

                  {session ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        void onLogout();
                      }}
                      className="w-full px-3 py-2.5 rounded-lg text-left text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>
                        {session.mode === 'guest' ? 'Exit Guest Mode' : 'Logout'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onNavigateLogin();
                      }}
                      className="w-full px-3 py-2.5 rounded-lg text-left text-[13px] font-semibold text-[var(--p-accent)] hover:bg-[var(--p-surface)] transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 shrink-0" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

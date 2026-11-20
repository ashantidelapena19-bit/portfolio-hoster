import React, { useEffect, useState } from 'react';
import { Check, Copy, RotateCcw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TOKEN_METADATA, ThemeMode } from '../data/themes';
import { useAntigravityScroll } from './AntigravityScrollProvider';
import { useTheme } from './ThemeProvider';

interface ColorSchemeDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ANTIGRAVITY_EASE = [0.22, 1, 0.36, 1] as const;

export const ColorSchemeDrawer: React.FC<ColorSchemeDrawerProps> = ({
  open,
  onClose,
}) => {
  const {
    activeScheme,
    tokens,
    overrides,
    presets,
    selectScheme,
    updateToken,
    resetOverrides,
    exportCssVariables,
  } = useTheme();
  const { pauseScroll, resumeScroll } = useAntigravityScroll();
  const [modeFilter, setModeFilter] = useState<'all' | ThemeMode>('all');
  const [copied, setCopied] = useState(false);

  const hasOverrides = Object.keys(overrides).length > 0;

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose, pauseScroll, resumeScroll]);

  const visiblePresets = presets.filter((p) =>
    modeFilter === 'all' ? true : p.mode === modeFilter
  );

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(exportCssVariables());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="color-scheme-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Color Scheme and Theme Token Organizer"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: ANTIGRAVITY_EASE }}
          className="fixed inset-0 z-50 bg-[var(--p-backdrop)] backdrop-blur-xs flex justify-end"
          onClick={onClose}
        >
          <motion.aside
            key="color-scheme-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.36, ease: ANTIGRAVITY_EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] h-full bg-[var(--p-surface-elevated)] text-[var(--p-ink)] border-l border-[var(--p-border)] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--p-border)] flex items-start justify-between gap-4 shrink-0">
              <div>
                <h2 className="text-[18px] font-bold tracking-tight text-[var(--p-ink)]">
                  Color Schemes & Tokens
                </h2>
                <p className="text-[13px] text-[var(--p-muted)] mt-0.5">
                  Organize semantic palette tokens and preview future theme modes.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close color scheme organizer"
                className="w-9 h-9 rounded-lg border border-[var(--p-border)] text-[var(--p-ink)] hover:bg-[var(--p-surface)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto px-6 py-6 space-y-8"
            >
              {/* Mode Filter + Preset Library */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-[14px] font-bold text-[var(--p-ink)]">
                    01. Curated Palette Presets
                  </h3>
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--p-surface)]">
                    {(['all', 'light', 'dark'] as const).map((tab) => {
                      const active = modeFilter === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setModeFilter(tab)}
                          className={`px-2.5 py-1 rounded-md text-[12px] font-semibold capitalize transition-colors cursor-pointer ${
                            active
                              ? 'bg-[var(--p-surface-elevated)] text-[var(--p-ink)] shadow-xs'
                              : 'text-[var(--p-muted)] hover:text-[var(--p-ink)]'
                          }`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {visiblePresets.map((preset) => {
                    const isSelected = preset.id === activeScheme.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectScheme(preset.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--p-accent)] bg-[var(--p-surface-subtle)]'
                            : 'border-[var(--p-border)] bg-[var(--p-surface-elevated)] hover:border-[var(--p-border-strong)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-bold text-[var(--p-ink)] truncate">
                                {preset.name}
                              </span>
                              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--p-muted)]">
                                · {preset.mode}
                              </span>
                            </div>
                            <p className="text-[12px] text-[var(--p-muted)] mt-0.5 truncate">
                              {preset.source}
                            </p>
                          </div>

                          {/* 4-dot palette preview */}
                          <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
                            <span
                              className="w-5 h-5 rounded-full border border-black/15"
                              style={{ backgroundColor: preset.tokens.bg }}
                            />
                            <span
                              className="w-5 h-5 rounded-full border border-black/15"
                              style={{ backgroundColor: preset.tokens.surface }}
                            />
                            <span
                              className="w-5 h-5 rounded-full border border-black/15"
                              style={{ backgroundColor: preset.tokens.ink }}
                            />
                            <span
                              className="w-5 h-5 rounded-full border border-black/15"
                              style={{ backgroundColor: preset.tokens.accent }}
                            />
                          </div>
                        </div>
                        <p className="text-[12px] text-[var(--p-ink-secondary)] mt-2.5 leading-relaxed">
                          {preset.note}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Semantic Token Inspector & Live Customizer */}
              <div className="pt-6 border-t border-[var(--p-border)]">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-[14px] font-bold text-[var(--p-ink)]">
                      02. Semantic Token Map
                    </h3>
                    <p className="text-[12px] text-[var(--p-muted)] mt-0.5">
                      Adjust any token below to test custom theme variations.
                    </p>
                  </div>
                  {hasOverrides && (
                    <button
                      type="button"
                      onClick={resetOverrides}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--p-border)] text-[12px] font-medium text-[var(--p-ink)] hover:bg-[var(--p-surface)] cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[var(--p-border)] border border-[var(--p-border)] rounded-xl overflow-hidden bg-[var(--p-bg)]">
                  {TOKEN_METADATA.map((meta) => {
                    const value = tokens[meta.key];
                    const isHex = /^#[0-9a-fA-F]{6}$/.test(value);
                    return (
                      <div
                        key={meta.key}
                        className="px-3.5 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-[var(--p-ink)]">
                              {meta.label}
                            </span>
                            <code className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--p-muted)]">
                              {meta.cssVar}
                            </code>
                          </div>
                          <p className="text-[11px] text-[var(--p-muted)] truncate mt-0.5">
                            {meta.role}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="color"
                            aria-label={`${meta.label} color picker`}
                            value={isHex ? value : '#000000'}
                            onChange={(e) => updateToken(meta.key, e.target.value)}
                            className="w-8 h-8 rounded-lg border border-[var(--p-border)] bg-transparent cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            aria-label={`${meta.label} hex value`}
                            value={value}
                            onChange={(e) => {
                              const next = e.target.value;
                              if (/^#[0-9a-fA-F]{0,6}$/.test(next)) {
                                updateToken(meta.key, next);
                              }
                            }}
                            className="w-[82px] px-2 py-1.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface)] text-[12px] font-[family-name:var(--font-mono)] text-[var(--p-ink)] focus:outline-none focus:border-[var(--p-accent)]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Exportable CSS Block */}
              <div className="pt-6 border-t border-[var(--p-border)]">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-[14px] font-bold text-[var(--p-ink)]">
                    03. CSS Variables Export
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyCss}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] hover:bg-[var(--p-action-hover)] text-[12px] font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied CSS</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Variables</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl border border-[var(--p-border)] bg-[var(--p-surface)] text-[11px] font-[family-name:var(--font-mono)] text-[var(--p-ink-secondary)] overflow-x-auto leading-relaxed">
                  {exportCssVariables()}
                </pre>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  COLOR_SCHEME_PRESETS,
  ColorSchemePreset,
  DEFAULT_SCHEME_ID,
  ThemeMode,
  ThemeTokens,
} from '../data/themes';

const STORAGE_KEY = 'se-class-a-theme-config-v1';

interface StoredThemeConfig {
  schemeId: string;
  overrides: Partial<ThemeTokens>;
}

interface ThemeContextValue {
  activeScheme: ColorSchemePreset;
  tokens: ThemeTokens;
  overrides: Partial<ThemeTokens>;
  mode: ThemeMode;
  presets: ColorSchemePreset[];
  selectScheme: (schemeId: string) => void;
  updateToken: (key: keyof ThemeTokens, value: string) => void;
  resetOverrides: () => void;
  exportCssVariables: () => string;
}

const defaultPreset = COLOR_SCHEME_PRESETS[0];

const ThemeContext = createContext<ThemeContextValue>({
  activeScheme: defaultPreset,
  tokens: defaultPreset.tokens,
  overrides: {},
  mode: defaultPreset.mode,
  presets: COLOR_SCHEME_PRESETS,
  selectScheme: () => {},
  updateToken: () => {},
  resetOverrides: () => {},
  exportCssVariables: () => '',
});

export const useTheme = () => useContext(ThemeContext);

function hexToRgba(hex: string, alpha: number): string | null {
  const clean = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustHex(hex: string, amount: number): string {
  const clean = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return hex;
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  const r = clamp(parseInt(clean.slice(0, 2), 16) + amount);
  const g = clamp(parseInt(clean.slice(2, 4), 16) + amount);
  const b = clamp(parseInt(clean.slice(4, 6), 16) + amount);
  return (
    '#' +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

function loadStoredConfig(): StoredThemeConfig {
  if (typeof window === 'undefined') {
    return { schemeId: DEFAULT_SCHEME_ID, overrides: {} };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { schemeId: DEFAULT_SCHEME_ID, overrides: {} };
    const parsed = JSON.parse(raw) as Partial<StoredThemeConfig>;
    const exists = COLOR_SCHEME_PRESETS.some((p) => p.id === parsed.schemeId);
    return {
      schemeId: exists && parsed.schemeId ? parsed.schemeId : DEFAULT_SCHEME_ID,
      overrides:
        parsed.overrides && typeof parsed.overrides === 'object'
          ? parsed.overrides
          : {},
    };
  } catch {
    return { schemeId: DEFAULT_SCHEME_ID, overrides: {} };
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<StoredThemeConfig>(loadStoredConfig);

  const activeScheme = useMemo(
    () =>
      COLOR_SCHEME_PRESETS.find((p) => p.id === config.schemeId) ??
      COLOR_SCHEME_PRESETS[0],
    [config.schemeId]
  );

  const tokens = useMemo<ThemeTokens>(() => {
    const merged: ThemeTokens = {
      ...activeScheme.tokens,
      ...config.overrides,
    };

    // Derive dependent hover/header tones automatically when base tokens are customized
    if (config.overrides.bg && !config.overrides.headerBg) {
      merged.headerBg =
        hexToRgba(merged.bg, activeScheme.mode === 'dark' ? 0.92 : 0.94) ??
        merged.headerBg;
    }
    if (config.overrides.accent && !config.overrides.accentHover) {
      merged.accentHover = adjustHex(
        merged.accent,
        activeScheme.mode === 'dark' ? 18 : -16
      );
    }
    if (config.overrides.action && !config.overrides.actionHover) {
      merged.actionHover = adjustHex(
        merged.action,
        activeScheme.mode === 'dark' ? -22 : 24
      );
    }

    return merged;
  }, [activeScheme, config.overrides]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = activeScheme.id;
    root.dataset.themeMode = activeScheme.mode;

    if (activeScheme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const cssEntries: [string, string][] = [
      ['--p-bg', tokens.bg],
      ['--p-surface', tokens.surface],
      ['--p-surface-subtle', tokens.surfaceSubtle],
      ['--p-surface-elevated', tokens.surfaceElevated],
      ['--p-ink', tokens.ink],
      ['--p-ink-secondary', tokens.inkSecondary],
      ['--p-muted', tokens.muted],
      ['--p-border', tokens.border],
      ['--p-border-strong', tokens.borderStrong],
      ['--p-accent', tokens.accent],
      ['--p-accent-hover', tokens.accentHover],
      ['--p-accent-ink', tokens.accentInk],
      ['--p-action', tokens.action],
      ['--p-action-hover', tokens.actionHover],
      ['--p-action-ink', tokens.actionInk],
      ['--p-header-bg', tokens.headerBg],
      ['--p-backdrop', tokens.backdrop],
    ];

    for (const [varName, value] of cssEntries) {
      root.style.setProperty(varName, value);
    }

    let metaThemeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = tokens.bg;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }, [activeScheme, tokens, config]);

  const selectScheme = useCallback((schemeId: string) => {
    setConfig({ schemeId, overrides: {} });
  }, []);

  const updateToken = useCallback((key: keyof ThemeTokens, value: string) => {
    setConfig((prev) => ({
      ...prev,
      overrides: { ...prev.overrides, [key]: value },
    }));
  }, []);

  const resetOverrides = useCallback(() => {
    setConfig((prev) => ({ ...prev, overrides: {} }));
  }, []);

  const exportCssVariables = useCallback(() => {
    return `:root[data-theme="${activeScheme.id}"] {
  --p-bg: ${tokens.bg};
  --p-surface: ${tokens.surface};
  --p-surface-subtle: ${tokens.surfaceSubtle};
  --p-surface-elevated: ${tokens.surfaceElevated};
  --p-ink: ${tokens.ink};
  --p-ink-secondary: ${tokens.inkSecondary};
  --p-muted: ${tokens.muted};
  --p-border: ${tokens.border};
  --p-accent: ${tokens.accent};
  --p-accent-ink: ${tokens.accentInk};
  --p-action: ${tokens.action};
  --p-action-ink: ${tokens.actionInk};
}`;
  }, [activeScheme.id, tokens]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      activeScheme,
      tokens,
      overrides: config.overrides,
      mode: activeScheme.mode,
      presets: COLOR_SCHEME_PRESETS,
      selectScheme,
      updateToken,
      resetOverrides,
      exportCssVariables,
    }),
    [
      activeScheme,
      tokens,
      config.overrides,
      selectScheme,
      updateToken,
      resetOverrides,
      exportCssVariables,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

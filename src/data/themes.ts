export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  ink: string;
  inkSecondary: string;
  muted: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentHover: string;
  accentInk: string;
  action: string;
  actionHover: string;
  actionInk: string;
  headerBg: string;
  backdrop: string;
}

export interface ColorSchemePreset {
  id: string;
  name: string;
  mode: ThemeMode;
  source: string;
  note: string;
  tokens: ThemeTokens;
}

export const TOKEN_METADATA: {
  key: keyof ThemeTokens;
  cssVar: string;
  label: string;
  role: string;
  editable: boolean;
}[] = [
  {
    key: 'bg',
    cssVar: '--p-bg',
    label: 'Page Canvas',
    role: '60% primary page background',
    editable: true,
  },
  {
    key: 'surface',
    cssVar: '--p-surface',
    label: 'Surface',
    role: 'Inputs, filter pills, thumbnail wells',
    editable: true,
  },
  {
    key: 'surfaceSubtle',
    cssVar: '--p-surface-subtle',
    label: 'Section Band',
    role: 'Alternating band backdrop (Tech Stack, Site Map)',
    editable: true,
  },
  {
    key: 'surfaceElevated',
    cssVar: '--p-surface-elevated',
    label: 'Card / Modal',
    role: 'Contributor cards, dialogs, select controls',
    editable: true,
  },
  {
    key: 'ink',
    cssVar: '--p-ink',
    label: 'Primary Ink',
    role: 'Headlines, primary copy, active titles',
    editable: true,
  },
  {
    key: 'inkSecondary',
    cssVar: '--p-ink-secondary',
    label: 'Secondary Ink',
    role: 'Navigation links, body summaries',
    editable: true,
  },
  {
    key: 'muted',
    cssVar: '--p-muted',
    label: 'Muted Ink',
    role: 'Metadata, roll numbers, captions',
    editable: true,
  },
  {
    key: 'border',
    cssVar: '--p-border',
    label: 'Hairline Border',
    role: 'Section rules, card outlines',
    editable: true,
  },
  {
    key: 'accent',
    cssVar: '--p-accent',
    label: 'Brand Accent',
    role: '10% focus: search CTA, likes, active links',
    editable: true,
  },
  {
    key: 'action',
    cssVar: '--p-action',
    label: 'Primary Action',
    role: 'High-contrast CTA buttons & active stack tiles',
    editable: true,
  },
];

export const COLOR_SCHEME_PRESETS: ColorSchemePreset[] = [
  {
    id: 'studio-gallery',
    name: 'Studio Gallery (Default)',
    mode: 'light',
    source: 'SE Class A Baseline',
    note: 'Crisp white showcase canvas with deep indigo ink and studio rose focus accents.',
    tokens: {
      bg: '#ffffff',
      surface: '#f3f3f6',
      surfaceSubtle: '#fafafb',
      surfaceElevated: '#ffffff',
      ink: '#0d0c22',
      inkSecondary: '#3d3d4e',
      muted: '#6e6d7a',
      border: '#e7e7e9',
      borderStrong: '#c8c8d0',
      accent: '#ea4c89',
      accentHover: '#d93d79',
      accentInk: '#ffffff',
      action: '#0d0c22',
      actionHover: '#272640',
      actionInk: '#ffffff',
      headerBg: 'rgba(255, 255, 255, 0.94)',
      backdrop: 'rgba(13, 12, 34, 0.7)',
    },
  },
  {
    id: 'white-link-blue',
    name: 'Sheet & Biro',
    mode: 'light',
    source: 'taste-skill · palettes.json',
    note: 'Pure white sheet with stark black typography, cool grey tiles, and biro cobalt accent.',
    tokens: {
      bg: '#ffffff',
      surface: '#f4f4f4',
      surfaceSubtle: '#f9f9f9',
      surfaceElevated: '#ffffff',
      ink: '#111111',
      inkSecondary: '#333333',
      muted: '#6b6b6b',
      border: '#e5e5e5',
      borderStrong: '#c4c4c4',
      accent: '#1a4be0',
      accentHover: '#143db8',
      accentInk: '#ffffff',
      action: '#111111',
      actionHover: '#2b2b2b',
      actionInk: '#ffffff',
      headerBg: 'rgba(255, 255, 255, 0.94)',
      backdrop: 'rgba(17, 17, 17, 0.72)',
    },
  },
  {
    id: 'cool-white-slate',
    name: 'Frost & Slate',
    mode: 'light',
    source: 'taste-skill · palettes.json',
    note: 'Cool frost canvas with slate-navy typography and restrained deep teal action points.',
    tokens: {
      bg: '#f7f9fa',
      surface: '#ecf0f2',
      surfaceSubtle: '#f1f5f7',
      surfaceElevated: '#ffffff',
      ink: '#1f3038',
      inkSecondary: '#384c56',
      muted: '#5d6b72',
      border: '#dce3e7',
      borderStrong: '#bcc7ce',
      accent: '#0d7480',
      accentHover: '#095c66',
      accentInk: '#ffffff',
      action: '#1f3038',
      actionHover: '#2f4651',
      actionInk: '#ffffff',
      headerBg: 'rgba(247, 249, 250, 0.94)',
      backdrop: 'rgba(20, 34, 41, 0.72)',
    },
  },
  {
    id: 'warm-paper-walnut',
    name: 'Warm Paper & Walnut',
    mode: 'light',
    source: 'taste-skill · palettes.json',
    note: 'Editorial warm paper backdrop paired with espresso-black ink and walnut brown controls.',
    tokens: {
      bg: '#f7f3ec',
      surface: '#ede6da',
      surfaceSubtle: '#f1ebe0',
      surfaceElevated: '#fcf9f4',
      ink: '#2a2622',
      inkSecondary: '#48413a',
      muted: '#665e55',
      border: '#dfd6c7',
      borderStrong: '#c5b9a6',
      accent: '#7a4a2c',
      accentHover: '#633a20',
      accentInk: '#ffffff',
      action: '#2a2622',
      actionHover: '#413b35',
      actionInk: '#fcf9f4',
      headerBg: 'rgba(247, 243, 236, 0.94)',
      backdrop: 'rgba(30, 25, 20, 0.72)',
    },
  },
  {
    id: 'lunar-grey-bronze',
    name: 'Lunar & Bronze',
    mode: 'dark',
    source: 'taste-skill · palettes.json',
    note: 'Soft obsidian dark mode with elevated charcoal panels, crisp off-white type, and bronze accents.',
    tokens: {
      bg: '#111111',
      surface: '#1c1c1c',
      surfaceSubtle: '#161616',
      surfaceElevated: '#1f1f1f',
      ink: '#f2f2f2',
      inkSecondary: '#c7c7c7',
      muted: '#8f8f8f',
      border: '#2b2b2b',
      borderStrong: '#404040',
      accent: '#c5a288',
      accentHover: '#d5b59d',
      accentInk: '#111111',
      action: '#f2f2f2',
      actionHover: '#dcdcdc',
      actionInk: '#111111',
      headerBg: 'rgba(17, 17, 17, 0.92)',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    },
  },
  {
    id: 'blue-black-cornflower',
    name: 'Night & Sky Blue',
    mode: 'dark',
    source: 'taste-skill · palettes.json',
    note: 'Deep midnight blue-black canvas with slate cards, silver ink, and luminous sky-blue highlights.',
    tokens: {
      bg: '#0a0d14',
      surface: '#131824',
      surfaceSubtle: '#0f131d',
      surfaceElevated: '#161c2a',
      ink: '#e9edf3',
      inkSecondary: '#bac3d2',
      muted: '#8891a1',
      border: '#21293b',
      borderStrong: '#33405c',
      accent: '#5ab9fc',
      accentHover: '#7bc7fd',
      accentInk: '#0a0d14',
      action: '#e9edf3',
      actionHover: '#cfd7e3',
      actionInk: '#0a0d14',
      headerBg: 'rgba(10, 13, 20, 0.92)',
      backdrop: 'rgba(5, 7, 12, 0.82)',
    },
  },
  {
    id: 'green-black-bone',
    name: 'Green-Black & Bone',
    mode: 'dark',
    source: 'taste-skill · palettes.json',
    note: 'Deep forest-charcoal mode with bone typography and calm pale-jade primary accents.',
    tokens: {
      bg: '#161c1a',
      surface: '#1f2725',
      surfaceSubtle: '#1a211f',
      surfaceElevated: '#232c29',
      ink: '#e3e2da',
      inkSecondary: '#b9bdb6',
      muted: '#8e948d',
      border: '#2d3835',
      borderStrong: '#42514d',
      accent: '#9fc7b8',
      accentHover: '#b3d6c8',
      accentInk: '#161c1a',
      action: '#e3e2da',
      actionHover: '#cdccc2',
      actionInk: '#161c1a',
      headerBg: 'rgba(22, 28, 26, 0.92)',
      backdrop: 'rgba(10, 14, 12, 0.82)',
    },
  },
];

export const DEFAULT_SCHEME_ID = 'studio-gallery';

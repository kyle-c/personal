/**
 * Felix design tokens — the single source of truth for the product's visual
 * language. Every primitive and every screen on the canvas reads these values
 * through CSS custom properties, so a change here (or via conversation)
 * propagates everywhere instantly.
 *
 * NOTE: these defaults are a placeholder rendition of the Felix design system
 * (http://felix-design.vercel.app was unreachable from the build environment).
 * To adopt the real Felix values, edit DEFAULT_TOKENS below — nothing else in
 * the app needs to change.
 */

export interface TokenSet {
  color: {
    primary: string;
    ink: string;
    background: string;
    surface: string;
    muted: string;
    border: string;
    positive: string;
    warning: string;
    danger: string;
  };
  typography: {
    displayFamily: string;
    bodyFamily: string;
    baseSize: number; // px
    scaleRatio: number; // modular scale
  };
  space: {
    unit: number; // px — everything is a multiple of this
    density: 'compact' | 'comfortable' | 'spacious';
  };
  radius: {
    base: number; // px
  };
  shadow: {
    level: 'none' | 'soft' | 'pronounced';
  };
}

export const DEFAULT_TOKENS: TokenSet = {
  color: {
    primary: '#8B5CF6',
    ink: '#333333',
    background: '#FAF9F5',
    surface: '#FFFFFF',
    muted: '#8A8578',
    border: '#E7E3D8',
    positive: '#3D8361',
    warning: '#B98A21',
    danger: '#B4453A',
  },
  typography: {
    displayFamily: '"Crimson Pro", Georgia, serif',
    bodyFamily: 'Inter, -apple-system, "Segoe UI", sans-serif',
    baseSize: 16,
    scaleRatio: 1.25,
  },
  space: {
    unit: 8,
    density: 'comfortable',
  },
  radius: {
    base: 8,
  },
  shadow: {
    level: 'soft',
  },
};

const DENSITY_MULTIPLIER: Record<TokenSet['space']['density'], number> = {
  compact: 0.75,
  comfortable: 1,
  spacious: 1.4,
};

const SHADOWS: Record<TokenSet['shadow']['level'], string> = {
  none: 'none',
  soft: '0 1px 3px rgba(30, 25, 15, 0.07), 0 4px 14px rgba(30, 25, 15, 0.05)',
  pronounced: '0 2px 6px rgba(30, 25, 15, 0.12), 0 12px 32px rgba(30, 25, 15, 0.14)',
};

/** Derive a full set of CSS custom properties from a token set. */
export function tokensToCssVars(t: TokenSet): Record<string, string> {
  const d = DENSITY_MULTIPLIER[t.space.density];
  const u = t.space.unit * d;
  const step = (n: number) =>
    `${(t.typography.baseSize * Math.pow(t.typography.scaleRatio, n)).toFixed(1)}px`;

  return {
    '--felix-color-primary': t.color.primary,
    '--felix-color-primary-soft': hexWithAlpha(t.color.primary, 0.12),
    '--felix-color-on-primary': bestTextOn(t.color.primary),
    '--felix-color-ink': t.color.ink,
    '--felix-color-background': t.color.background,
    '--felix-color-surface': t.color.surface,
    '--felix-color-muted': t.color.muted,
    '--felix-color-border': t.color.border,
    '--felix-color-positive': t.color.positive,
    '--felix-color-warning': t.color.warning,
    '--felix-color-danger': t.color.danger,
    '--felix-font-display': t.typography.displayFamily,
    '--felix-font-body': t.typography.bodyFamily,
    '--felix-text-sm': step(-1),
    '--felix-text-base': step(0),
    '--felix-text-lg': step(1),
    '--felix-text-xl': step(2),
    '--felix-text-2xl': step(3),
    '--felix-text-3xl': step(4),
    '--felix-space-1': `${u * 0.5}px`,
    '--felix-space-2': `${u}px`,
    '--felix-space-3': `${u * 1.5}px`,
    '--felix-space-4': `${u * 2}px`,
    '--felix-space-6': `${u * 3}px`,
    '--felix-space-8': `${u * 4}px`,
    '--felix-radius-sm': `${Math.max(0, t.radius.base * 0.5)}px`,
    '--felix-radius': `${t.radius.base}px`,
    '--felix-radius-lg': `${t.radius.base * 2}px`,
    '--felix-radius-full': '9999px',
    '--felix-shadow': SHADOWS[t.shadow.level],
  };
}

// ---------------------------------------------------------------------------
// Color math (used for derived tokens and the accessibility audit)
// ---------------------------------------------------------------------------

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) {
    const short = hex.trim().match(/^#?([0-9a-f]{3})$/i);
    if (!short) return null;
    const s = short[1];
    return [
      parseInt(s[0] + s[0], 16),
      parseInt(s[1] + s[1], 16),
      parseInt(s[2] + s[2], 16),
    ];
  }
  const v = m[1];
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return (
    0.2126 * channelLuminance(rgb[0]) +
    0.7152 * channelLuminance(rgb[1]) +
    0.0722 * channelLuminance(rgb[2])
  );
}

/** WCAG contrast ratio between two hex colors. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Pick black or white text for a given background. */
export function bestTextOn(bg: string): string {
  return contrastRatio(bg, '#FFFFFF') >= contrastRatio(bg, '#1A1A1A')
    ? '#FFFFFF'
    : '#1A1A1A';
}

/** Named colors the conversational parser understands. */
export const NAMED_COLORS: Record<string, string> = {
  red: '#B4453A',
  crimson: '#A63446',
  orange: '#D97A32',
  amber: '#B98A21',
  yellow: '#C9A227',
  olive: '#7A7A33',
  green: '#3D8361',
  forest: '#2C5F44',
  emerald: '#2F9E77',
  teal: '#2E7D7B',
  cyan: '#2492A5',
  sky: '#3D87C2',
  blue: '#3B6FB5',
  navy: '#2C4770',
  indigo: '#4F46B5',
  violet: '#6D4FC2',
  purple: '#8B5CF6',
  plum: '#7E4A8C',
  magenta: '#B0468F',
  pink: '#C25D7F',
  rose: '#B54A5F',
  brown: '#7A5C42',
  terracotta: '#B85E43',
  charcoal: '#3A3A38',
  black: '#1A1A1A',
  slate: '#5A6472',
  gray: '#6E6E6E',
  grey: '#6E6E6E',
};

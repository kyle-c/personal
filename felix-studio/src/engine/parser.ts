/**
 * The conversational layer: turns a designer's natural-language request into
 * a structured intent the studio can execute. Deterministic and offline —
 * in a production system this is where an LLM grounded in the design system
 * would sit; the contract (Intent) would stay the same.
 */
import { NAMED_COLORS } from '../felix/tokens';
import { BlockKind } from './types';

export type Intent =
  | { type: 'create-screen'; name: string; blocks: BlockKind[] }
  | { type: 'add-block'; block: BlockKind; screenName?: string }
  | { type: 'remove-block'; block: BlockKind; screenName?: string }
  | { type: 'remove-screen'; screenName: string }
  | { type: 'set-color'; slot: 'primary' | 'background' | 'ink'; value: string }
  | { type: 'set-radius'; direction: 'rounder' | 'sharper' | 'set'; value?: number }
  | { type: 'set-density'; density: 'compact' | 'comfortable' | 'spacious' }
  | { type: 'set-shadow'; level: 'none' | 'soft' | 'pronounced' }
  | { type: 'set-font'; slot: 'display' | 'body'; family: string }
  | { type: 'audit' }
  | { type: 'fix-drift' }
  | { type: 'undo' }
  | { type: 'help' }
  | { type: 'unknown'; input: string };

const BLOCK_ALIASES: Record<string, BlockKind> = {
  nav: 'navbar',
  navbar: 'navbar',
  navigation: 'navbar',
  header: 'navbar',
  hero: 'hero',
  banner: 'hero',
  feature: 'features',
  features: 'features',
  'feature grid': 'features',
  stat: 'stats',
  stats: 'stats',
  metrics: 'stats',
  kpi: 'stats',
  dashboard: 'stats',
  form: 'form',
  signup: 'form',
  'sign up': 'form',
  'sign-up': 'form',
  login: 'form',
  contact: 'form',
  pricing: 'pricing',
  plans: 'pricing',
  testimonial: 'testimonial',
  testimonials: 'testimonial',
  quote: 'testimonial',
  table: 'table',
  list: 'table',
  cta: 'cta',
  'call to action': 'cta',
  footer: 'footer',
};

function findBlocks(text: string): BlockKind[] {
  const found: BlockKind[] = [];
  // Longest aliases first so "feature grid" wins over "grid".
  const aliases = Object.keys(BLOCK_ALIASES).sort((a, b) => b.length - a.length);
  let remaining = text;
  for (const alias of aliases) {
    const re = new RegExp(`\\b${alias.replace(/[-\s]/g, '[-\\s]')}\\b`, 'i');
    if (re.test(remaining)) {
      const kind = BLOCK_ALIASES[alias];
      if (!found.includes(kind)) found.push(kind);
      remaining = remaining.replace(re, ' ');
    }
  }
  return found;
}

function findColor(text: string): string | null {
  const hex = text.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/i);
  if (hex) return hex[0].toUpperCase();
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  for (const w of words) {
    if (NAMED_COLORS[w]) return NAMED_COLORS[w];
  }
  return null;
}

/** Extract a screen name from phrases like `on the pricing page` / `to settings`. */
function findScreenRef(text: string): string | undefined {
  const m = text.match(/(?:on|to|from|in)\s+(?:the\s+)?([\w\s-]+?)\s+(?:page|screen)/i);
  return m ? m[1].trim() : undefined;
}

export function parse(inputRaw: string): Intent {
  const input = inputRaw.trim();
  const lower = input.toLowerCase();

  if (/^(help|what can you do|\?)/.test(lower)) return { type: 'help' };
  if (/\b(fix|repair|clean|resolve)\b.*\bdrift\b/.test(lower) || /\bsnap\b.*\btokens?\b/.test(lower)) {
    return { type: 'fix-drift' };
  }
  if (/\b(undo|revert|roll ?back)\b/.test(lower)) return { type: 'undo' };
  if (/\b(audit|drift|review|check|inspect|health)\b/.test(lower) && !/\bcheckbox\b/.test(lower)) {
    return { type: 'audit' };
  }

  // --- Token intents -------------------------------------------------------
  if (/\b(color|colour)\b/.test(lower) || /#[0-9a-f]{3,6}\b/i.test(lower)) {
    const slot = /\bbackground\b/.test(lower)
      ? 'background'
      : /\b(text|ink)\b/.test(lower)
        ? 'ink'
        : 'primary';
    const value = findColor(lower);
    if (value) return { type: 'set-color', slot, value };
  }
  // "make the buttons purple" — color word without the word "color"
  if (/\b(make|turn|paint|set)\b/.test(lower)) {
    const value = findColor(lower);
    if (value && !/\bpage|screen|form|hero|table|pricing\b/.test(lower)) {
      const slot = /\bbackground\b/.test(lower) ? 'background' : 'primary';
      return { type: 'set-color', slot, value };
    }
  }

  if (/\b(rounder|more rounded|softer corners|friendlier)\b/.test(lower)) {
    return { type: 'set-radius', direction: 'rounder' };
  }
  if (/\b(sharper|less rounded|square|crisper corners)\b/.test(lower)) {
    return { type: 'set-radius', direction: 'sharper' };
  }
  const radiusMatch = lower.match(/\bradius\b.*?(\d+)\s*(?:px)?/);
  if (radiusMatch) {
    return { type: 'set-radius', direction: 'set', value: parseInt(radiusMatch[1], 10) };
  }

  if (/\b(compact|denser|tighter)\b/.test(lower)) return { type: 'set-density', density: 'compact' };
  if (/\b(spacious|airier|more breathing room|roomier)\b/.test(lower)) {
    return { type: 'set-density', density: 'spacious' };
  }
  if (/\bcomfortable\b/.test(lower)) return { type: 'set-density', density: 'comfortable' };

  if (/\bshadow/.test(lower)) {
    if (/\b(no|remove|flat|none)\b/.test(lower)) return { type: 'set-shadow', level: 'none' };
    if (/\b(strong|pronounced|deep|dramatic|heavier)\b/.test(lower)) {
      return { type: 'set-shadow', level: 'pronounced' };
    }
    return { type: 'set-shadow', level: 'soft' };
  }

  if (/\b(font|typeface|typography)\b/.test(lower)) {
    const slot = /\b(heading|display|title)\b/.test(lower) ? 'display' : 'body';
    if (/\bserif\b/.test(lower) && !/\bsans\b/.test(lower)) {
      return { type: 'set-font', slot, family: '"Crimson Pro", Georgia, serif' };
    }
    if (/\b(sans|modern|clean)\b/.test(lower)) {
      return { type: 'set-font', slot, family: 'Inter, -apple-system, "Segoe UI", sans-serif' };
    }
    if (/\bmono\b/.test(lower)) {
      return { type: 'set-font', slot, family: '"SF Mono", ui-monospace, Menlo, monospace' };
    }
  }

  // --- Screen intents ------------------------------------------------------
  const createMatch = lower.match(
    /\b(?:create|add|make|build|new)\b.*?\b(?:a\s+|an\s+|the\s+)?([\w\s-]+?)\s+(?:page|screen)\b/i,
  );
  if (createMatch && /\b(create|make|build|new|add)\b/.test(lower)) {
    const name = createMatch[1]
      .replace(/\b(new|a|an|the)\b/gi, '')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (name) {
      const blocks = findBlocks(lower.replace(createMatch[0], ''));
      return { type: 'create-screen', name, blocks };
    }
  }

  if (/\b(remove|delete|drop)\b/.test(lower)) {
    const screenRef = lower.match(/\b(?:remove|delete|drop)\s+(?:the\s+)?([\w\s-]+?)\s+(?:page|screen)\b/i);
    if (screenRef) return { type: 'remove-screen', screenName: screenRef[1].trim() };
    const blocks = findBlocks(lower);
    if (blocks.length > 0) {
      return { type: 'remove-block', block: blocks[0], screenName: findScreenRef(lower) };
    }
  }

  if (/\b(add|insert|put|include)\b/.test(lower)) {
    const blocks = findBlocks(lower);
    if (blocks.length > 0) {
      return { type: 'add-block', block: blocks[0], screenName: findScreenRef(lower) };
    }
  }

  return { type: 'unknown', input };
}

export const HELP_TEXT = [
  'Here is what you can ask me to do:',
  '• Build — "create a pricing page with a hero and pricing table", "add a signup form to the home page", "remove the footer"',
  '• Restyle — "change the primary color to forest green", "set the background to #F4F1EA", "make everything rounder", "sharper corners", "radius 12px"',
  '• Typography & rhythm — "use a serif for headings", "switch body font to sans", "make the layout more compact", "more breathing room"',
  '• Depth — "remove all shadows", "give cards a pronounced shadow"',
  '• Maintain — "audit the product", "undo that"',
  'Every change is recorded in the Changelog with a one-click revert.',
].join('\n');

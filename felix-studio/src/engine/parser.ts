/**
 * The conversational layer: turns a designer's natural-language request into
 * a structured intent the studio can execute. Deterministic and offline —
 * in a production system this is where an LLM grounded in the design system
 * would sit; the contract (Intent) would stay the same.
 */
import { NAMED_COLORS } from '../felix/tokens';
import { BlockKind, BlockProps, SurfaceType } from './types';

export type ContentProp =
  | 'headline'
  | 'subhead'
  | 'badge'
  | 'brand'
  | 'quote'
  | 'title'
  | 'button';

export type Intent =
  | { type: 'create-screen'; name: string; blocks: BlockKind[]; surface: SurfaceType }
  | { type: 'add-block'; block: BlockKind; screenName?: string }
  | { type: 'remove-block'; block: BlockKind; screenName?: string }
  | { type: 'remove-screen'; screenName: string }
  | { type: 'set-business'; name?: string; industry?: string }
  | { type: 'rewrite-copy'; screenName?: string; force?: boolean }
  | { type: 'set-prop'; prop: ContentProp; value: string; screenName?: string }
  /** LLM-authored content for one block — produced by the brain, not the regex parser. */
  | { type: 'set-props'; block: BlockKind; props: BlockProps; screenName?: string }
  | { type: 'set-voice'; tone?: 'warm' | 'professional' | 'playful'; emoji?: boolean }
  | { type: 'set-color'; slot: 'primary' | 'background' | 'ink'; value: string }
  | { type: 'set-radius'; direction: 'rounder' | 'sharper' | 'set'; value?: number }
  | { type: 'set-density'; density: 'compact' | 'comfortable' | 'spacious' }
  | { type: 'set-shadow'; level: 'none' | 'soft' | 'pronounced' }
  | { type: 'set-font'; slot: 'display' | 'body'; family: string }
  | { type: 'export' }
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
  'pricing table': 'pricing',
  plans: 'pricing',
  testimonial: 'testimonial',
  testimonials: 'testimonial',
  quote: 'testimonial',
  table: 'table',
  'data table': 'table',
  list: 'table',
  cta: 'cta',
  'call to action': 'cta',
  footer: 'footer',
};

function findBlocks(text: string): BlockKind[] {
  const found: { kind: BlockKind; index: number }[] = [];
  // Longest aliases first so "pricing table" wins over both "pricing" and
  // "table". Consumed text is blanked (not removed) so indices stay stable,
  // letting us return blocks in the order the designer said them.
  const aliases = Object.keys(BLOCK_ALIASES).sort((a, b) => b.length - a.length);
  let remaining = text;
  for (const alias of aliases) {
    const re = new RegExp(`\\b${alias.replace(/[-\s]/g, '[-\\s]')}\\b`, 'i');
    const m = remaining.match(re);
    if (m && m.index !== undefined) {
      const kind = BLOCK_ALIASES[alias];
      if (!found.some((f) => f.kind === kind)) found.push({ kind, index: m.index });
      remaining =
        remaining.slice(0, m.index) +
        ' '.repeat(m[0].length) +
        remaining.slice(m.index + m[0].length);
    }
  }
  return found.sort((a, b) => a.index - b.index).map((f) => f.kind);
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
  const m = text.match(/(?:on|to|from|in)\s+(?:the\s+)?([\w\s-]+?)\s+(?:page|screen|flow)/i);
  return m ? m[1].trim() : undefined;
}

function detectSurface(text: string): SurfaceType {
  if (/\b(whatsapp|chat\s?bot|chat\s?flow|sms|messag(?:e|ing)\s+flow|conversation(?:al)?\s+flow)\b/i.test(text)) {
    return 'chat';
  }
  if (/\b(native|mobile|ios|android|app)\s+(page|screen|home|view)\b/i.test(text) || /\bapp screen\b/i.test(text)) {
    return 'native';
  }
  return 'web';
}

function stripQuotes(s: string): string {
  return s.replace(/^["'“”]+|["'“”.]+$/g, '').trim();
}

export function parse(inputRaw: string): Intent {
  const input = inputRaw.trim();
  const lower = input.toLowerCase();

  if (/^(help|what can you do|\?)/.test(lower)) return { type: 'help' };
  if (/\b(fix|repair|clean|resolve)\b.*\bdrift\b/.test(lower) || /\bsnap\b.*\btokens?\b/.test(lower)) {
    return { type: 'fix-drift' };
  }
  if (/\b(undo|roll ?back)\b/.test(lower) || /^revert\b/.test(lower)) return { type: 'undo' };
  if (/\bexport\b|\bship it\b|\bgenerate (the )?code\b/.test(lower)) return { type: 'export' };

  // --- Brand / business ----------------------------------------------------
  // "this is a dental clinic called Brightside", "set up for a bakery named Crumb",
  // "we're a climbing gym", "rebrand to Alpine".
  const rebrand = input.match(/\brebrand\s+(?:to|as)\s+(.+)/i);
  if (rebrand) return { type: 'set-business', name: stripQuotes(rebrand[1]) };
  const bizMatch = input.match(
    /\b(?:this is|set ?up for|we(?:'| a)?re|i'?m building|build (?:this )?for|make (?:this|it) for)\s+(?:now\s+)?(?:a|an)\s+(.+?)(?:\s+(?:called|named)\s+(.+))?$/i,
  );
  if (bizMatch && !/\b(page|screen|flow|block|section|color|colour|font)\b/i.test(bizMatch[1])) {
    const industry = stripQuotes(bizMatch[1]);
    const name = bizMatch[2] ? stripQuotes(bizMatch[2]) : undefined;
    return { type: 'set-business', industry, name };
  }

  // "rewrite the copy", "regenerate the content on the home page".
  // "…including my edits" / "…everything" overwrites hand-edited content too.
  if (/\b(rewrite|regenerate|refresh|redo)\b.*\b(copy|content|text|words|everything)\b/.test(lower)) {
    const force = /\b(everything|including (my|the|hand) ?edits|overwrite|even my edits)\b/.test(lower);
    return { type: 'rewrite-copy', screenName: findScreenRef(lower), force };
  }

  // --- Content edits: change the headline to "..." --------------------------
  const propMatch = input.match(
    /\b(?:change|set|update|make)\s+the\s+(headline|sub-?head(?:ing)?|badge|brand|quote|title|button)\b[^]*?\bto\s+(.+)$/i,
  );
  if (propMatch) {
    const word = propMatch[1].toLowerCase().replace(/-/g, '');
    const prop: ContentProp =
      word.startsWith('subhead') ? 'subhead'
      : word === 'headline' ? 'headline'
      : word === 'badge' ? 'badge'
      : word === 'brand' ? 'brand'
      : word === 'quote' ? 'quote'
      : word === 'title' ? 'title'
      : 'button';
    const value = stripQuotes(propMatch[2]);
    // Guard: "change the primary color to red" is not a content edit.
    if (!/\b(color|colour)\b/i.test(input) && value) {
      return { type: 'set-prop', prop, value, screenName: findScreenRef(lower) };
    }
  }

  // --- Voice ----------------------------------------------------------------
  if (/\b(voice|tone)\b/.test(lower) || /\bemoji/.test(lower)) {
    const tone = /\bplayful|fun|cheeky\b/.test(lower)
      ? ('playful' as const)
      : /\bprofessional|formal|serious\b/.test(lower)
        ? ('professional' as const)
        : /\bwarm|friendly|casual\b/.test(lower)
          ? ('warm' as const)
          : undefined;
    const emoji = /\b(use|add|with|enable)\b.*\bemoji/.test(lower)
      ? true
      : /\b(no|remove|drop|without|disable)\b.*\bemoji/.test(lower)
        ? false
        : undefined;
    if (tone !== undefined || emoji !== undefined) return { type: 'set-voice', tone, emoji };
  }

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
    if (value && !/\bpage|screen|flow|form|hero|table|pricing\b/.test(lower)) {
      const slot = /\bbackground\b/.test(lower) ? 'background' : 'primary';
      return { type: 'set-color', slot, value };
    }
  }

  if (/\b(rounder|more rounded|softer corners|friendlier corners)\b/.test(lower)) {
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
    /\b(?:create|add|make|build|new)\b.*?\b(?:a\s+|an\s+|the\s+)?([\w\s-]+?)\s+(?:page|screen|flow|bot)\b/i,
  );
  if (createMatch && /\b(create|make|build|new|add)\b/.test(lower)) {
    const surface = detectSurface(lower);
    let name = createMatch[1]
      .replace(/\b(new|a|an|the|whatsapp|chat|mobile|native|ios|android|app|web)\b/gi, '')
      .trim();
    if (!name) {
      // "create a whatsapp flow for orders" — the name lives after "for".
      const forMatch = lower.match(/\b(?:for|about)\s+([\w\s-]+?)\s*$/);
      name = forMatch ? forMatch[1].trim() : '';
    }
    if (!name) name = surface === 'chat' ? 'new flow' : 'new screen';
    name = name.replace(/\b\w/g, (c) => c.toUpperCase());
    const blocks = surface === 'chat' ? [] : findBlocks(lower.replace(createMatch[0], ''));
    return { type: 'create-screen', name, blocks, surface };
  }

  if (/\b(remove|delete|drop)\b/.test(lower)) {
    const screenRef = lower.match(/\b(?:remove|delete|drop)\s+(?:the\s+)?([\w\s-]+?)\s+(?:page|screen|flow)\b/i);
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
  '• Brand — "this is a dental clinic called Brightside" (rewrites the whole product for that business), "rebrand to Alpine", "rewrite the copy"',
  '• Build — "create a pricing page with a hero and pricing table", "create an app screen for booking", "create a whatsapp flow for support", "add a signup form to the home page"',
  '• Content — "change the headline to Fresh bread daily", "change the quote to …"',
  '• Restyle — "change the primary color to forest green", "make everything rounder", "radius 12px", "use a serif for headings", "more breathing room"',
  '• Voice — "make the tone playful", "use emoji in chat", "make the voice professional"',
  '• Ship — "export the code" (HTML, React Native, WhatsApp flow JSON)',
  '• Maintain — "audit the product", "fix drift", "undo"',
  'Every change lands in the Changelog with a one-click revert.',
].join('\n');

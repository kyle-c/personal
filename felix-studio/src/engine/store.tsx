/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { DEFAULT_TOKENS, TokenSet } from '../felix/tokens';
import { runAudit } from './audit';
import { HELP_TEXT, Intent, parse } from './parser';
import {
  Block,
  BlockKind,
  ChangelogEntry,
  Message,
  Screen,
  Selection,
  StudioState,
} from './types';

let idCounter = 0;
const uid = () => `id-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

const STORAGE_KEY = 'felix-studio-state-v2';
const LEGACY_STORAGE_KEY = 'felix-studio-state-v1';

/** Frame width on the canvas; matches the Canvas component. */
export const FRAME_WIDTH = 960;
const FRAME_GAP = 140;

// ---------------------------------------------------------------------------
// Seed: a small product already in flight, so the canvas is never empty.
// ---------------------------------------------------------------------------

function seedState(): StudioState {
  const home: Screen = {
    id: uid(),
    name: 'Home',
    x: 0,
    y: 0,
    blocks: [
      { id: uid(), kind: 'navbar' },
      { id: uid(), kind: 'hero' },
      { id: uid(), kind: 'features' },
      { id: uid(), kind: 'cta' },
      { id: uid(), kind: 'footer' },
    ],
  };
  const dashboard: Screen = {
    id: uid(),
    name: 'Dashboard',
    x: FRAME_WIDTH + FRAME_GAP,
    y: 0,
    blocks: [
      { id: uid(), kind: 'navbar' },
      { id: uid(), kind: 'stats' },
      // Deliberate drift for the audit to find — a block that was “hot-fixed”
      // outside the token system.
      { id: uid(), kind: 'table', overrides: { background: '#EFEAF9', radius: 2 } },
    ],
  };
  return {
    tokens: DEFAULT_TOKENS,
    screens: [home, dashboard],
    selection: { kind: 'none' },
    messages: [
      {
        id: uid(),
        role: 'felix',
        text:
          'Hi, I’m Felix — your design system, in conversation. Every frame on this canvas is composed from my tokens and primitives, so we can build and restyle the product together just by talking.\n\nTry: “create a pricing page with a hero and pricing table”, “change the primary color to forest green”, “make everything rounder”, or “audit the product”. Type “help” for the full range.\n\nCanvas basics: scroll to pan, ⌘/Ctrl + scroll to zoom, click a frame or a section to select it.',
      },
    ],
    changelog: [],
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | { type: 'converse'; input: string }
  | { type: 'select'; selection: Selection }
  | { type: 'rename-screen'; screenId: string; name: string }
  | { type: 'move-screen'; screenId: string; x: number; y: number }
  | { type: 'delete-block'; screenId: string; blockId: string }
  | { type: 'shift-block'; screenId: string; blockId: string; dir: -1 | 1 }
  | { type: 'clear-overrides'; screenId: string; blockId: string }
  | { type: 'undo' }
  | { type: 'set-tokens-direct'; tokens: TokenSet; summary: string }
  | { type: 'revert-to'; entryId: string }
  | { type: 'reset' };

function snapshot(state: StudioState): ChangelogEntry['before'] {
  return {
    tokens: JSON.parse(JSON.stringify(state.tokens)),
    screens: JSON.parse(JSON.stringify(state.screens)),
  };
}

function withChange(
  state: StudioState,
  kind: ChangelogEntry['kind'],
  summary: string,
  detail: string | undefined,
  mutate: (draft: StudioState) => void,
): StudioState {
  const entry: ChangelogEntry = {
    id: uid(),
    seq: (state.changelog[0]?.seq ?? 0) + 1,
    summary,
    detail,
    kind,
    before: snapshot(state),
  };
  const draft: StudioState = {
    ...state,
    tokens: JSON.parse(JSON.stringify(state.tokens)),
    screens: JSON.parse(JSON.stringify(state.screens)),
  };
  mutate(draft);
  return { ...draft, changelog: [entry, ...state.changelog] };
}

/** The screen the conversation refers to when none is named: the selected one. */
function contextScreen(state: StudioState): Screen | undefined {
  if (state.selection.kind !== 'none') {
    const hit = state.screens.find((s) => s.id === (state.selection as { screenId: string }).screenId);
    if (hit) return hit;
  }
  return state.screens[0];
}

function findScreen(state: StudioState, ref?: string): Screen | undefined {
  if (!ref) return contextScreen(state);
  const lower = ref.toLowerCase();
  return (
    state.screens.find((s) => s.name.toLowerCase() === lower) ??
    state.screens.find((s) => s.name.toLowerCase().includes(lower))
  );
}

/** Where the next created frame goes: right of the rightmost frame. */
function nextFramePosition(screens: Screen[]): { x: number; y: number } {
  if (screens.length === 0) return { x: 0, y: 0 };
  const maxX = Math.max(...screens.map((s) => s.x));
  return { x: maxX + FRAME_WIDTH + FRAME_GAP, y: Math.min(...screens.map((s) => s.y)) };
}

const BLOCK_LABELS: Record<BlockKind, string> = {
  navbar: 'navigation bar',
  hero: 'hero',
  features: 'feature grid',
  stats: 'stat row',
  form: 'form',
  pricing: 'pricing table',
  testimonial: 'testimonial',
  table: 'data table',
  cta: 'call-to-action',
  footer: 'footer',
};

export { BLOCK_LABELS };

function reply(state: StudioState, text: string, audit?: Message['audit']): StudioState {
  return {
    ...state,
    messages: [...state.messages, { id: uid(), role: 'felix', text, audit }],
  };
}

function applyUndo(state: StudioState): StudioState {
  const last = state.changelog[0];
  if (!last) return reply(state, 'There’s nothing to undo yet — the changelog is empty.');
  const reverted: StudioState = {
    ...state,
    tokens: last.before.tokens,
    screens: last.before.screens,
    changelog: state.changelog.slice(1),
  };
  return reply(sanitizeSelection(reverted), `Reverted “${last.summary}”.`);
}

/** Drop the selection if it points at something that no longer exists. */
function sanitizeSelection(state: StudioState): StudioState {
  const sel = state.selection;
  if (sel.kind === 'none') return state;
  const screen = state.screens.find((s) => s.id === sel.screenId);
  if (!screen) return { ...state, selection: { kind: 'none' } };
  if (sel.kind === 'block' && !screen.blocks.some((b) => b.id === sel.blockId)) {
    return { ...state, selection: { kind: 'screen', screenId: screen.id } };
  }
  return state;
}

function executeIntent(state: StudioState, intent: Intent): StudioState {
  switch (intent.type) {
    case 'help':
      return reply(state, HELP_TEXT);

    case 'audit': {
      const findings = runAudit(state.tokens, state.screens);
      const issues = findings.filter((f) => f.severity === 'issue').length;
      const warnings = findings.filter((f) => f.severity === 'warning').length;
      const headline =
        issues + warnings === 0 || findings[0]?.severity === 'ok'
          ? 'I walked every frame — the product is healthy.'
          : `I walked every frame and found ${issues} issue${issues === 1 ? '' : 's'} and ${warnings} warning${warnings === 1 ? '' : 's'}:`;
      return reply(state, headline, findings);
    }

    case 'fix-drift': {
      const drifted: string[] = [];
      const next = withChange(state, 'screen', 'Fixed token drift', undefined, (draft) => {
        for (const screen of draft.screens) {
          for (const block of screen.blocks) {
            if (block.overrides && Object.keys(block.overrides).length > 0) {
              drifted.push(`${BLOCK_LABELS[block.kind]} on “${screen.name}”`);
              delete block.overrides;
            }
          }
        }
      });
      if (drifted.length === 0) {
        return reply(state, 'No drift to fix — every block is already reading straight from the tokens.');
      }
      return reply(next, `Done. I removed the hard-coded overrides from ${drifted.join(' and ')} and snapped them back to the token system.`);
    }

    case 'undo':
      return applyUndo(state);

    case 'create-screen': {
      const existing = findScreen(state, intent.name);
      if (existing && existing.name.toLowerCase() === intent.name.toLowerCase()) {
        return reply(state, `There’s already a “${existing.name}” frame — say “add a hero to the ${existing.name.toLowerCase()} page” to keep building it.`);
      }
      const blocks: BlockKind[] =
        intent.blocks.length > 0 ? intent.blocks : ['navbar', 'hero', 'footer'];
      const ordered = orderBlocks(blocks);
      const pos = nextFramePosition(state.screens);
      const screen: Screen = {
        id: uid(),
        name: intent.name,
        x: pos.x,
        y: pos.y,
        blocks: ordered.map((kind) => ({ id: uid(), kind })),
      };
      const next = withChange(
        state,
        'screen',
        `Created “${intent.name}” screen`,
        `Composed from: ${ordered.map((k) => BLOCK_LABELS[k]).join(', ')}`,
        (draft) => {
          draft.screens.push(screen);
          draft.selection = { kind: 'screen', screenId: screen.id };
        },
      );
      const auto = intent.blocks.length === 0 ? ' I started it with a navbar, hero and footer — tell me what to add next.' : '';
      return reply(next, `Created the “${intent.name}” frame with ${ordered.length} section${ordered.length === 1 ? '' : 's'}, all composed from Felix primitives. It’s on the canvas to the right.${auto}`);
    }

    case 'remove-screen': {
      const screen = findScreen(state, intent.screenName);
      if (!screen) return reply(state, `I couldn’t find a frame called “${intent.screenName}”.`);
      if (state.screens.length === 1) {
        return reply(state, 'That’s the last frame — I’d rather not leave the canvas empty. Create another screen first.');
      }
      const next = withChange(state, 'screen', `Removed “${screen.name}” screen`, undefined, (draft) => {
        draft.screens = draft.screens.filter((s) => s.id !== screen.id);
      });
      return reply(sanitizeSelection(next), `Removed the “${screen.name}” frame. Its blocks are gone, but “undo” brings it back.`);
    }

    case 'add-block': {
      const screen = findScreen(state, intent.screenName);
      if (!screen) {
        return reply(state, `I couldn’t find a frame matching “${intent.screenName}”. Which screen should this go on?`);
      }
      let newBlockId = '';
      const next = withChange(
        state,
        'screen',
        `Added ${BLOCK_LABELS[intent.block]} to “${screen.name}”`,
        undefined,
        (draft) => {
          const target = draft.screens.find((s) => s.id === screen.id)!;
          const block: Block = { id: uid(), kind: intent.block };
          newBlockId = block.id;
          insertBlock(target, block);
          draft.selection = { kind: 'block', screenId: target.id, blockId: block.id };
        },
      );
      void newBlockId;
      return reply(next, `Added a ${BLOCK_LABELS[intent.block]} to “${screen.name}”. It reads straight from the tokens, so it already matches everything else.`);
    }

    case 'remove-block': {
      // If a block of this kind is selected, prefer that exact one.
      const sel = state.selection;
      let screen = findScreen(state, intent.screenName);
      if (
        !intent.screenName &&
        sel.kind === 'block'
      ) {
        const selScreen = state.screens.find((s) => s.id === sel.screenId);
        const selBlock = selScreen?.blocks.find((b) => b.id === sel.blockId);
        if (selScreen && selBlock?.kind === intent.block) screen = selScreen;
      }
      if (!screen) return reply(state, `I couldn’t find that frame.`);
      const idx = screen.blocks.findIndex((b) => b.kind === intent.block);
      if (idx === -1) {
        return reply(state, `“${screen.name}” doesn’t have a ${BLOCK_LABELS[intent.block]}.`);
      }
      const next = withChange(
        state,
        'screen',
        `Removed ${BLOCK_LABELS[intent.block]} from “${screen.name}”`,
        undefined,
        (draft) => {
          const target = draft.screens.find((s) => s.id === screen!.id)!;
          const i = target.blocks.findIndex((b) => b.kind === intent.block);
          target.blocks.splice(i, 1);
        },
      );
      return reply(sanitizeSelection(next), `Removed the ${BLOCK_LABELS[intent.block]} from “${screen.name}”.`);
    }

    case 'set-color': {
      const prev = state.tokens.color[intent.slot];
      if (prev.toUpperCase() === intent.value.toUpperCase()) {
        return reply(state, `The ${intent.slot} color is already ${intent.value}.`);
      }
      const next = withChange(
        state,
        'token',
        `Changed ${intent.slot} color`,
        `${prev} → ${intent.value}`,
        (draft) => {
          draft.tokens.color[intent.slot] = intent.value;
        },
      );
      const audit = runAudit(next.tokens, next.screens).filter(
        (f) =>
          f.severity !== 'ok' &&
          (f.title.toLowerCase().includes('contrast') || f.title.toLowerCase().includes('read')),
      );
      const caveat = audit.length > 0 ? ` One heads-up: ${audit[0].detail}` : '';
      return reply(next, `Updated the ${intent.slot} color token to ${intent.value}. Every frame that uses it just changed with it — that’s the point of a single source of truth.${caveat}`);
    }

    case 'set-radius': {
      const current = state.tokens.radius.base;
      const value =
        intent.direction === 'set'
          ? Math.max(0, Math.min(24, intent.value ?? current))
          : intent.direction === 'rounder'
            ? Math.min(24, current + 4)
            : Math.max(0, current - 4);
      if (value === current) {
        return reply(state, `Corner radius is already at ${current}px${current === 0 ? ' (fully square)' : current === 24 ? ' (as round as Felix goes)' : ''}.`);
      }
      const next = withChange(state, 'token', 'Adjusted corner radius', `${current}px → ${value}px`, (draft) => {
        draft.tokens.radius.base = value;
      });
      return reply(next, `Corner radius is now ${value}px across buttons, inputs and cards.`);
    }

    case 'set-density': {
      if (state.tokens.space.density === intent.density) {
        return reply(state, `The layout is already ${intent.density}.`);
      }
      const prev = state.tokens.space.density;
      const next = withChange(state, 'token', `Set spacing density to ${intent.density}`, `${prev} → ${intent.density}`, (draft) => {
        draft.tokens.space.density = intent.density;
      });
      return reply(next, `Spacing is now ${intent.density}. The whole rhythm of the product shifted — no frame had to be touched individually.`);
    }

    case 'set-shadow': {
      if (state.tokens.shadow.level === intent.level) {
        return reply(state, `Shadows are already set to ${intent.level}.`);
      }
      const next = withChange(state, 'token', `Set shadows to ${intent.level}`, undefined, (draft) => {
        draft.tokens.shadow.level = intent.level;
      });
      return reply(next, intent.level === 'none' ? 'Shadows removed — the product is fully flat now.' : `Shadows set to ${intent.level}.`);
    }

    case 'set-font': {
      const key = intent.slot === 'display' ? 'displayFamily' : 'bodyFamily';
      if (state.tokens.typography[key] === intent.family) {
        return reply(state, `The ${intent.slot} font is already ${intent.family.split(',')[0].replace(/"/g, '')}.`);
      }
      const next = withChange(
        state,
        'token',
        `Changed ${intent.slot} typeface`,
        `→ ${intent.family.split(',')[0].replace(/"/g, '')}`,
        (draft) => {
          draft.tokens.typography[key] = intent.family;
        },
      );
      return reply(next, `The ${intent.slot} typeface is now ${intent.family.split(',')[0].replace(/"/g, '')}.`);
    }

    case 'unknown':
      return reply(
        state,
        'I didn’t catch a design intent in that. I can build screens, restyle tokens, audit for drift, and undo changes — type “help” to see phrasings I understand.',
      );
  }
}

/** Keep structural blocks in sensible positions: navbar first, footer last. */
function orderBlocks(kinds: BlockKind[]): BlockKind[] {
  const middle = kinds.filter((k) => k !== 'navbar' && k !== 'footer');
  return [
    ...(kinds.includes('navbar') ? (['navbar'] as BlockKind[]) : []),
    ...middle,
    ...(kinds.includes('footer') ? (['footer'] as BlockKind[]) : []),
  ];
}

function insertBlock(screen: Screen, block: Block) {
  if (block.kind === 'navbar') {
    screen.blocks.unshift(block);
    return;
  }
  if (block.kind === 'footer') {
    screen.blocks.push(block);
    return;
  }
  const footerIdx = screen.blocks.findIndex((b) => b.kind === 'footer');
  if (footerIdx === -1) screen.blocks.push(block);
  else screen.blocks.splice(footerIdx, 0, block);
}

function reducer(state: StudioState, action: Action): StudioState {
  switch (action.type) {
    case 'converse': {
      const input = action.input.trim();
      if (!input) return state;
      const withUser: StudioState = {
        ...state,
        messages: [...state.messages, { id: uid(), role: 'designer', text: input }],
      };
      return executeIntent(withUser, parse(input));
    }

    case 'select':
      return { ...state, selection: action.selection };

    case 'rename-screen': {
      const screen = state.screens.find((s) => s.id === action.screenId);
      const name = action.name.trim();
      if (!screen || !name || screen.name === name) return state;
      return withChange(state, 'screen', `Renamed “${screen.name}” to “${name}”`, undefined, (draft) => {
        draft.screens.find((s) => s.id === action.screenId)!.name = name;
      });
    }

    case 'move-screen': {
      // Position moves are canvas arrangement, not design changes — no changelog.
      return {
        ...state,
        screens: state.screens.map((s) =>
          s.id === action.screenId ? { ...s, x: action.x, y: action.y } : s,
        ),
      };
    }

    case 'delete-block': {
      const screen = state.screens.find((s) => s.id === action.screenId);
      const block = screen?.blocks.find((b) => b.id === action.blockId);
      if (!screen || !block) return state;
      const next = withChange(
        state,
        'screen',
        `Removed ${BLOCK_LABELS[block.kind]} from “${screen.name}”`,
        undefined,
        (draft) => {
          const target = draft.screens.find((s) => s.id === action.screenId)!;
          target.blocks = target.blocks.filter((b) => b.id !== action.blockId);
        },
      );
      return sanitizeSelection(next);
    }

    case 'shift-block': {
      const screen = state.screens.find((s) => s.id === action.screenId);
      if (!screen) return state;
      const idx = screen.blocks.findIndex((b) => b.id === action.blockId);
      const to = idx + action.dir;
      if (idx === -1 || to < 0 || to >= screen.blocks.length) return state;
      const block = screen.blocks[idx];
      return withChange(
        state,
        'screen',
        `Moved ${BLOCK_LABELS[block.kind]} ${action.dir === -1 ? 'up' : 'down'} on “${screen.name}”`,
        undefined,
        (draft) => {
          const target = draft.screens.find((s) => s.id === action.screenId)!;
          const [moved] = target.blocks.splice(idx, 1);
          target.blocks.splice(to, 0, moved);
        },
      );
    }

    case 'clear-overrides': {
      const screen = state.screens.find((s) => s.id === action.screenId);
      const block = screen?.blocks.find((b) => b.id === action.blockId);
      if (!screen || !block || !block.overrides) return state;
      return withChange(
        state,
        'screen',
        `Fixed token drift on “${screen.name}”`,
        undefined,
        (draft) => {
          const target = draft.screens
            .find((s) => s.id === action.screenId)!
            .blocks.find((b) => b.id === action.blockId)!;
          delete target.overrides;
        },
      );
    }

    case 'undo':
      return applyUndo(state);

    case 'set-tokens-direct': {
      return withChange(state, 'token', action.summary, undefined, (draft) => {
        draft.tokens = action.tokens;
      });
    }

    case 'revert-to': {
      const entry = state.changelog.find((e) => e.id === action.entryId);
      if (!entry) return state;
      const idx = state.changelog.indexOf(entry);
      const reverted: StudioState = {
        ...state,
        tokens: entry.before.tokens,
        screens: entry.before.screens,
        changelog: state.changelog.slice(idx + 1),
      };
      return reply(
        sanitizeSelection(reverted),
        `Rolled the system back to just before “${entry.summary}” (change #${entry.seq}).`,
      );
    }

    case 'reset':
      return seedState();
  }
}

// ---------------------------------------------------------------------------
// Context + persistence
// ---------------------------------------------------------------------------

interface StudioContextValue {
  state: StudioState;
  dispatch: (action: Action) => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

function loadInitial(): StudioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StudioState;
      if (
        parsed.tokens &&
        Array.isArray(parsed.screens) &&
        parsed.screens.length > 0 &&
        typeof parsed.screens[0].x === 'number'
      ) {
        return { ...parsed, selection: parsed.selection ?? { kind: 'none' } };
      }
    }
    // Migrate a pre-canvas (v1) save: lay its screens out left to right.
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as StudioState & { activeScreenId?: string };
      if (parsed.tokens && Array.isArray(parsed.screens) && parsed.screens.length > 0) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return {
          tokens: parsed.tokens,
          screens: parsed.screens.map((s, i) => ({
            ...s,
            x: i * (FRAME_WIDTH + FRAME_GAP),
            y: 0,
          })),
          selection: { kind: 'none' },
          messages: parsed.messages ?? [],
          changelog: [],
        };
      }
    }
  } catch {
    // fall through to seed
  }
  return seedState();
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable — persistence is best-effort
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider');
  return ctx;
}

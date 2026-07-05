/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { DEFAULT_TOKENS, TokenSet } from '../felix/tokens';
import {
  currentRoom,
  extractDoc,
  FelixSync,
  Identity,
  loadIdentity,
  Peer,
  SyncDoc,
  SyncStatus,
} from './sync';
import { runAudit } from './audit';
import {
  generateBlockProps,
  generateFlowSteps,
  regenerateBlocks,
} from './copywriter';
import { ContentProp, HELP_TEXT, Intent, parse } from './parser';
import {
  Block,
  BlockKind,
  Business,
  ChangelogEntry,
  ChatStep,
  Message,
  Screen,
  Selection,
  StudioState,
  SurfaceType,
} from './types';

let idCounter = 0;
const uid = () => `id-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

const STORAGE_KEY = 'felix-studio-state-v3';

/** Frame widths on the canvas, by surface; matches the Canvas component. */
export const FRAME_WIDTHS: Record<SurfaceType, number> = {
  web: 960,
  native: 390,
  chat: 390,
};
const FRAME_GAP = 140;

export const SURFACE_LABELS: Record<SurfaceType, string> = {
  web: 'Web',
  native: 'App',
  chat: 'WhatsApp',
};

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

// ---------------------------------------------------------------------------
// Seed: a small product already in flight, so the canvas is never empty.
// ---------------------------------------------------------------------------

const SEED_BUSINESS: Business = {
  name: 'Fieldnote',
  industry: 'field journal software for people who work outdoors',
};

function makeBlocks(kinds: BlockKind[], business: Business): Block[] {
  return kinds.map((kind) => ({ id: uid(), kind, props: generateBlockProps(kind, business) }));
}

function seedState(): StudioState {
  const business = SEED_BUSINESS;
  const home: Screen = {
    id: uid(),
    name: 'Home',
    surface: 'web',
    x: 0,
    y: 0,
    steps: [],
    blocks: makeBlocks(['navbar', 'hero', 'features', 'cta', 'footer'], business),
  };
  const dashboard: Screen = {
    id: uid(),
    name: 'Dashboard',
    surface: 'web',
    x: FRAME_WIDTHS.web + FRAME_GAP,
    y: 0,
    steps: [],
    blocks: makeBlocks(['navbar', 'stats', 'table'], business),
  };
  // Deliberate drift for the audit to find — a block that was “hot-fixed”
  // outside the token system.
  dashboard.blocks[2].overrides = { background: '#EFEAF9', radius: 2 };

  const appHome: Screen = {
    id: uid(),
    name: 'App Home',
    surface: 'native',
    x: (FRAME_WIDTHS.web + FRAME_GAP) * 2,
    y: 0,
    steps: [],
    blocks: makeBlocks(['navbar', 'hero', 'stats', 'cta'], business),
  };
  const support: Screen = {
    id: uid(),
    name: 'Support',
    surface: 'chat',
    x: (FRAME_WIDTHS.web + FRAME_GAP) * 2 + FRAME_WIDTHS.native + FRAME_GAP,
    y: 0,
    blocks: [],
    steps: generateFlowSteps(business, DEFAULT_TOKENS.voice, uid),
  };

  return {
    business,
    tokens: DEFAULT_TOKENS,
    screens: [home, dashboard, appHome, support],
    selection: { kind: 'none' },
    messages: [
      {
        id: uid(),
        role: 'felix',
        text:
          'Hi, I’m Felix — your design system, in conversation. This canvas holds one product on three surfaces: web pages, an app screen, and a WhatsApp flow — all generated from one business profile, one token set, one voice.\n\nThe fastest way to feel it: say “this is a dental clinic called Brightside” and watch every surface rewrite itself. Or try “create a whatsapp flow for orders”, “change the headline to …”, “make the tone playful”, “audit the product”, “export the code”. Type “help” for everything.\n\nCanvas basics: scroll to pan, ⌘/Ctrl + scroll to zoom, click any frame, section or chat step to select it.',
      },
    ],
    changelog: [],
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | { type: 'remote-sync'; doc: SyncDoc }
  | { type: 'converse'; input: string }
  | { type: 'select'; selection: Selection }
  | { type: 'rename-screen'; screenId: string; name: string }
  | { type: 'move-screen'; screenId: string; x: number; y: number }
  | { type: 'delete-block'; screenId: string; blockId: string }
  | { type: 'shift-block'; screenId: string; blockId: string; dir: -1 | 1 }
  | { type: 'clear-overrides'; screenId: string; blockId: string }
  | { type: 'set-block-props'; screenId: string; blockId: string; props: Block['props']; summary: string }
  | { type: 'edit-step'; screenId: string; stepId: string; patch: Partial<ChatStep>; summary: string }
  | { type: 'add-step'; screenId: string }
  | { type: 'delete-step'; screenId: string; stepId: string }
  | { type: 'undo' }
  | { type: 'set-tokens-direct'; tokens: TokenSet; summary: string }
  | { type: 'set-business-direct'; business: Business; regenerate: boolean }
  | { type: 'revert-to'; entryId: string }
  | { type: 'reset' };

function snapshot(state: StudioState): ChangelogEntry['before'] {
  return {
    tokens: JSON.parse(JSON.stringify(state.tokens)),
    screens: JSON.parse(JSON.stringify(state.screens)),
    business: JSON.parse(JSON.stringify(state.business)),
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
    business: JSON.parse(JSON.stringify(state.business)),
  };
  mutate(draft);
  return { ...draft, changelog: [entry, ...state.changelog] };
}

/** The screen the conversation refers to when none is named: the selected one. */
function contextScreen(state: StudioState): Screen | undefined {
  if (state.selection.kind !== 'none') {
    const hit = state.screens.find(
      (s) => s.id === (state.selection as { screenId: string }).screenId,
    );
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
  const maxRight = Math.max(...screens.map((s) => s.x + FRAME_WIDTHS[s.surface]));
  return { x: maxRight + FRAME_GAP, y: Math.min(...screens.map((s) => s.y)) };
}

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
    business: last.before.business ?? state.business,
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
  if (sel.kind === 'step' && !screen.steps.some((s) => s.id === sel.stepId)) {
    return { ...state, selection: { kind: 'screen', screenId: screen.id } };
  }
  return state;
}

/** Which prop key and block kinds a spoken content word maps to. */
const PROP_TARGETS: Record<ContentProp, { key: keyof Block['props']; kinds: BlockKind[] }> = {
  headline: { key: 'headline', kinds: ['hero', 'cta'] },
  subhead: { key: 'subhead', kinds: ['hero', 'cta'] },
  badge: { key: 'badge', kinds: ['hero'] },
  brand: { key: 'brand', kinds: ['navbar', 'footer'] },
  quote: { key: 'quote', kinds: ['testimonial'] },
  title: { key: 'title', kinds: ['form'] },
  button: { key: 'primaryCta', kinds: ['hero', 'cta'] },
};

function executeIntent(state: StudioState, intent: Intent): StudioState {
  switch (intent.type) {
    case 'help':
      return reply(state, HELP_TEXT);

    case 'export':
      return reply(
        state,
        'Use the Export button in the toolbar (top right) — it generates real artifacts per surface: a standalone HTML page for web screens, a React Native component for app screens, and a WhatsApp-style flow definition (JSON) for chat flows. Copy or download each one.',
      );

    case 'audit': {
      const findings = runAudit(state.tokens, state.screens);
      const issues = findings.filter((f) => f.severity === 'issue').length;
      const warnings = findings.filter((f) => f.severity === 'warning').length;
      const headline =
        issues + warnings === 0 || findings[0]?.severity === 'ok'
          ? 'I walked every surface — the product is healthy.'
          : `I walked every surface and found ${issues} issue${issues === 1 ? '' : 's'} and ${warnings} warning${warnings === 1 ? '' : 's'}:`;
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

    case 'set-business': {
      const name = intent.name ?? state.business.name;
      const industry = intent.industry ?? state.business.industry;
      if (name === state.business.name && industry === state.business.industry) {
        return reply(state, `The product is already set up as ${name} (${industry}).`);
      }
      const business: Business = { name, industry };
      const next = withChange(
        state,
        'brand',
        `Rebranded to ${name}`,
        industry !== state.business.industry ? industry : undefined,
        (draft) => {
          draft.business = business;
          for (const screen of draft.screens) {
            screen.blocks = regenerateBlocks(screen.blocks, business);
            if (screen.surface === 'chat') {
              screen.steps = generateFlowSteps(business, draft.tokens.voice, uid);
            }
          }
        },
      );
      return reply(
        next,
        `Done — the product is now ${name}${intent.industry ? `, a ${industry}` : ''}. I rewrote every headline, feature, pricing tier, form and chat flow across all ${state.screens.length} frames from the new profile. Structure and tokens stayed put; only the content changed. Say “undo” if the old brand should come back.`,
      );
    }

    case 'rewrite-copy': {
      const target = intent.screenName ? findScreen(state, intent.screenName) : undefined;
      const next = withChange(
        state,
        'brand',
        target ? `Rewrote copy on “${target.name}”` : 'Rewrote copy across the product',
        undefined,
        (draft) => {
          for (const screen of draft.screens) {
            if (target && screen.id !== target.id) continue;
            screen.blocks = regenerateBlocks(screen.blocks, draft.business);
            if (screen.surface === 'chat') {
              screen.steps = generateFlowSteps(draft.business, draft.tokens.voice, uid);
            }
          }
        },
      );
      return reply(
        next,
        target
          ? `Refreshed the copy on “${target.name}” from the ${state.business.name} profile.`
          : `Refreshed every headline, feature and chat message from the ${state.business.name} profile.`,
      );
    }

    case 'set-prop': {
      const target = PROP_TARGETS[intent.prop];
      const sel = state.selection;
      let screen: Screen | undefined;
      let block: Block | undefined;
      // Prefer the selected block when it can hold this prop.
      if (sel.kind === 'block') {
        const s = state.screens.find((sc) => sc.id === sel.screenId);
        const b = s?.blocks.find((bl) => bl.id === sel.blockId);
        if (s && b && target.kinds.includes(b.kind)) {
          screen = s;
          block = b;
        }
      }
      if (!block) {
        screen = findScreen(state, intent.screenName);
        block = screen?.blocks.find((b) => target.kinds.includes(b.kind));
        if (!block) {
          for (const s of state.screens) {
            const hit = s.blocks.find((b) => target.kinds.includes(b.kind));
            if (hit) {
              screen = s;
              block = hit;
              break;
            }
          }
        }
      }
      if (!screen || !block) {
        return reply(state, `I couldn’t find a section with a ${intent.prop} to change. Select the section first, or tell me which page it’s on.`);
      }
      const screenId = screen.id;
      const blockId = block.id;
      const next = withChange(
        state,
        'screen',
        `Changed ${intent.prop} on “${screen.name}”`,
        `→ “${intent.value}”`,
        (draft) => {
          const b = draft.screens.find((s) => s.id === screenId)!.blocks.find((bl) => bl.id === blockId)!;
          (b.props[target.key] as string) = intent.value;
        },
      );
      return reply(next, `Updated the ${intent.prop} on “${screen.name}” to “${intent.value}”.`);
    }

    case 'set-voice': {
      const tone = intent.tone ?? state.tokens.voice.tone;
      const emoji = intent.emoji ?? state.tokens.voice.emoji;
      if (tone === state.tokens.voice.tone && emoji === state.tokens.voice.emoji) {
        return reply(state, `The voice is already ${tone}${emoji ? ' with emoji' : ''}.`);
      }
      const next = withChange(
        state,
        'token',
        `Set voice to ${tone}${emoji ? ' + emoji' : intent.emoji === false ? ', no emoji' : ''}`,
        undefined,
        (draft) => {
          draft.tokens.voice = { tone, emoji };
          // Voice is a token: regenerate conversational surfaces from it.
          for (const screen of draft.screens) {
            if (screen.surface === 'chat') {
              screen.steps = generateFlowSteps(draft.business, { tone, emoji }, uid);
            }
          }
        },
      );
      return reply(
        next,
        `Voice tokens updated: ${tone}${emoji ? ', emoji on' : intent.emoji === false ? ', emoji off' : ''}. Chat flows were regenerated in the new voice — visual surfaces keep their copy until you say “rewrite the copy”.`,
      );
    }

    case 'create-screen': {
      const existing = state.screens.find((s) => s.name.toLowerCase() === intent.name.toLowerCase());
      if (existing) {
        return reply(state, `There’s already a “${existing.name}” frame — say “add a hero to the ${existing.name.toLowerCase()} page” to keep building it.`);
      }
      const pos = nextFramePosition(state.screens);
      const screen: Screen = {
        id: uid(),
        name: intent.name,
        surface: intent.surface,
        x: pos.x,
        y: pos.y,
        blocks: [],
        steps: [],
      };
      let describe = '';
      if (intent.surface === 'chat') {
        screen.steps = generateFlowSteps(state.business, state.tokens.voice, uid);
        describe = `a WhatsApp flow with ${screen.steps.length} steps (welcome, actions, info, human handoff), written in the ${state.tokens.voice.tone} voice`;
      } else {
        const kinds: BlockKind[] =
          intent.blocks.length > 0
            ? orderBlocks(intent.blocks)
            : intent.surface === 'native'
              ? ['navbar', 'hero', 'cta']
              : ['navbar', 'hero', 'footer'];
        screen.blocks = makeBlocks(kinds, state.business);
        describe = `${kinds.length} section${kinds.length === 1 ? '' : 's'} (${kinds.map((k) => BLOCK_LABELS[k]).join(', ')}), with copy generated for ${state.business.name}`;
      }
      const next = withChange(
        state,
        'screen',
        `Created “${intent.name}” ${SURFACE_LABELS[intent.surface]} frame`,
        undefined,
        (draft) => {
          draft.screens.push(screen);
          draft.selection = { kind: 'screen', screenId: screen.id };
        },
      );
      return reply(next, `Created the “${intent.name}” ${SURFACE_LABELS[intent.surface]} frame with ${describe}. It’s on the canvas to the right.`);
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
      return reply(sanitizeSelection(next), `Removed the “${screen.name}” frame. Its contents are gone, but “undo” brings it back.`);
    }

    case 'add-block': {
      const screen = findScreen(state, intent.screenName);
      if (!screen) {
        return reply(state, `I couldn’t find a frame matching “${intent.screenName}”. Which screen should this go on?`);
      }
      if (screen.surface === 'chat') {
        return reply(state, `“${screen.name}” is a chat flow — it takes steps, not sections. Select it and use “Add step”, or create the ${BLOCK_LABELS[intent.block]} on a web or app screen.`);
      }
      const next = withChange(
        state,
        'screen',
        `Added ${BLOCK_LABELS[intent.block]} to “${screen.name}”`,
        undefined,
        (draft) => {
          const target = draft.screens.find((s) => s.id === screen.id)!;
          const block: Block = {
            id: uid(),
            kind: intent.block,
            props: generateBlockProps(intent.block, draft.business),
          };
          insertBlock(target, block);
          draft.selection = { kind: 'block', screenId: target.id, blockId: block.id };
        },
      );
      return reply(next, `Added a ${BLOCK_LABELS[intent.block]} to “${screen.name}”, with copy written for ${state.business.name}. It reads straight from the tokens, so it already matches everything else.`);
    }

    case 'remove-block': {
      const sel = state.selection;
      let screen = findScreen(state, intent.screenName);
      if (!intent.screenName && sel.kind === 'block') {
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
      return reply(next, `Updated the ${intent.slot} color token to ${intent.value}. Every surface that uses it just changed with it — that’s the point of a single source of truth.${caveat}`);
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
      return reply(next, `Corner radius is now ${value}px across buttons, inputs, cards and chat bubbles.`);
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
        'I didn’t catch a design intent in that. I can rebrand the product for any business, build screens and chat flows, edit content, restyle tokens, audit for drift, and export code — type “help” to see phrasings I understand.',
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
    case 'remote-sync': {
      // A teammate's change arrived: adopt the shared document, keep this
      // tab's selection (dropping it if it points at something now gone).
      return sanitizeSelection({ ...state, ...action.doc });
    }

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

    case 'set-block-props': {
      const screen = state.screens.find((s) => s.id === action.screenId);
      const block = screen?.blocks.find((b) => b.id === action.blockId);
      if (!screen || !block) return state;
      if (JSON.stringify(block.props) === JSON.stringify(action.props)) return state;
      return withChange(state, 'screen', action.summary, undefined, (draft) => {
        const b = draft.screens
          .find((s) => s.id === action.screenId)!
          .blocks.find((bl) => bl.id === action.blockId)!;
        b.props = action.props;
      });
    }

    case 'edit-step': {
      const screen = state.screens.find((s) => s.id === action.screenId);
      const step = screen?.steps.find((s) => s.id === action.stepId);
      if (!screen || !step) return state;
      return withChange(state, 'screen', action.summary, undefined, (draft) => {
        const t = draft.screens
          .find((s) => s.id === action.screenId)!
          .steps.find((s) => s.id === action.stepId)!;
        Object.assign(t, action.patch);
      });
    }

    case 'add-step': {
      const screen = state.screens.find((s) => s.id === action.screenId);
      if (!screen || screen.surface !== 'chat') return state;
      const stepId = uid();
      const next = withChange(state, 'screen', `Added step to “${screen.name}”`, undefined, (draft) => {
        const t = draft.screens.find((s) => s.id === action.screenId)!;
        t.steps.push({
          id: stepId,
          name: `Step ${t.steps.length + 1}`,
          message: 'New message — edit me in the inspector.',
          replies: [{ label: 'Back to start', goTo: t.steps[0]?.id }],
        });
      });
      return { ...next, selection: { kind: 'step', screenId: screen.id, stepId } };
    }

    case 'delete-step': {
      const screen = state.screens.find((s) => s.id === action.screenId);
      const step = screen?.steps.find((s) => s.id === action.stepId);
      if (!screen || !step) return state;
      const next = withChange(state, 'screen', `Removed step “${step.name}” from “${screen.name}”`, undefined, (draft) => {
        const t = draft.screens.find((s) => s.id === action.screenId)!;
        t.steps = t.steps.filter((s) => s.id !== action.stepId);
      });
      return sanitizeSelection(next);
    }

    case 'undo':
      return applyUndo(state);

    case 'set-tokens-direct': {
      return withChange(state, 'token', action.summary, undefined, (draft) => {
        draft.tokens = action.tokens;
      });
    }

    case 'set-business-direct': {
      return withChange(state, 'brand', `Updated business profile: ${action.business.name}`, action.business.industry, (draft) => {
        draft.business = action.business;
        if (action.regenerate) {
          for (const screen of draft.screens) {
            screen.blocks = regenerateBlocks(screen.blocks, action.business);
            if (screen.surface === 'chat') {
              screen.steps = generateFlowSteps(action.business, draft.tokens.voice, uid);
            }
          }
        }
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
        business: entry.before.business ?? state.business,
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

interface CollabContextValue {
  status: SyncStatus;
  peers: Peer[];
  identity: Identity;
  room: string;
  sendCursor: (cursor: { x: number; y: number } | null) => void;
}

const CollabContext = createContext<CollabContextValue | null>(null);

function loadInitial(): StudioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StudioState;
      if (
        parsed.tokens &&
        parsed.business &&
        Array.isArray(parsed.screens) &&
        parsed.screens.length > 0 &&
        parsed.screens[0].surface !== undefined
      ) {
        return { ...parsed, selection: parsed.selection ?? { kind: 'none' } };
      }
    }
    // Pre-multisurface saves (v1/v2) had hard-coded Fieldnote content and no
    // business profile — their structure can't carry forward, so reseed.
  } catch {
    // fall through to seed
  }
  return seedState();
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [status, setStatus] = useState<SyncStatus>('connecting');
  const identity = useMemo(loadIdentity, []);
  const room = useMemo(currentRoom, []);
  const syncRef = useRef<FelixSync | null>(null);
  // JSON of the last doc that came FROM the server — used to suppress echo:
  // when our own state equals it, there is nothing of ours to send.
  const lastRemoteJson = useRef<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const sync = new FelixSync(room, identity, {
      onRemoteDoc: (doc) => {
        lastRemoteJson.current = JSON.stringify(doc);
        dispatch({ type: 'remote-sync', doc });
      },
      onSeedRequest: () => {
        const doc = extractDoc(stateRef.current);
        lastRemoteJson.current = null;
        sync.sendDoc(doc);
      },
      onPeers: setPeers,
      onStatus: setStatus,
    });
    syncRef.current = sync;
    return () => sync.close();
    // identity and room are stable for the life of the tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push local document changes to the room (skipping remote echoes).
  useEffect(() => {
    const doc = extractDoc(state);
    const json = JSON.stringify(doc);
    if (json !== lastRemoteJson.current) {
      syncRef.current?.sendDoc(doc);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable — persistence is best-effort
    }
  }, [state]);

  // Selection is presence, not document state.
  useEffect(() => {
    syncRef.current?.sendSelection(state.selection);
  }, [state.selection]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  const collab = useMemo<CollabContextValue>(
    () => ({
      status,
      peers,
      identity,
      room,
      sendCursor: (c) => syncRef.current?.sendCursor(c),
    }),
    [status, peers, identity, room],
  );
  return (
    <StudioContext.Provider value={value}>
      <CollabContext.Provider value={collab}>{children}</CollabContext.Provider>
    </StudioContext.Provider>
  );
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider');
  return ctx;
}

export function useCollab(): CollabContextValue {
  const ctx = useContext(CollabContext);
  if (!ctx) throw new Error('useCollab must be used inside StudioProvider');
  return ctx;
}

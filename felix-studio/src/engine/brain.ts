/**
 * Client side of Felix's LLM brain. Sends the designer's message plus a
 * compact product summary to the sync server's /felix endpoint and maps the
 * returned actions onto the studio's Intent contract. Every action is
 * validated here — the LLM proposes, the studio disposes. When the server is
 * missing or has no API key, callers fall back to the deterministic parser.
 */
import { Intent } from './parser';
import { BlockKind, BlockProps, StudioState } from './types';

const BRAIN_URL = `http://${window.location.hostname}:8787/felix`;
const BLOCK_KINDS: BlockKind[] = ['navbar', 'hero', 'features', 'stats', 'form', 'pricing', 'testimonial', 'table', 'cta', 'footer'];

export interface BrainResult {
  reply: string;
  intents: Intent[];
}

/** Compact, token-cheap summary of the product for the model. */
function summarize(state: StudioState) {
  const sel = state.selection;
  const selScreen = sel.kind !== 'none' ? state.screens.find((s) => s.id === sel.screenId) : undefined;
  let selection = 'nothing selected';
  if (sel.kind === 'screen' && selScreen) selection = `frame “${selScreen.name}”`;
  if (sel.kind === 'block' && selScreen) {
    const b = selScreen.blocks.find((x) => x.id === sel.blockId);
    selection = `${b?.kind ?? 'section'} on “${selScreen.name}”`;
  }
  if (sel.kind === 'step' && selScreen) {
    const st = selScreen.steps.find((x) => x.id === sel.stepId);
    selection = `chat step “${st?.name ?? '?'}” on “${selScreen.name}”`;
  }
  return {
    business: state.business,
    voice: state.tokens.voice,
    tokens: {
      color: state.tokens.color,
      radius: state.tokens.radius.base,
      density: state.tokens.space.density,
      shadow: state.tokens.shadow.level,
      displayFont: state.tokens.typography.displayFamily.split(',')[0],
      bodyFont: state.tokens.typography.bodyFamily.split(',')[0],
    },
    screens: state.screens.map((s) => ({
      name: s.name,
      surface: s.surface,
      blocks: s.blocks.map((b) => `${b.kind}${b.custom ? ' (hand-edited)' : ''}${b.overrides ? ' (drifted)' : ''}`),
      steps: s.steps.map((st) => `${st.name}${st.custom ? ' (hand-edited)' : ''}`),
    })),
    selection,
  };
}

const isBlockKind = (v: unknown): v is BlockKind => BLOCK_KINDS.includes(v as BlockKind);
const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/** Drop null-valued props the schema forced the model to include. */
function cleanProps(raw: Record<string, unknown>): BlockProps {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (v !== null && v !== undefined) out[k] = v;
  }
  return out as BlockProps;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toIntent(a: any): Intent | null {
  switch (a?.type) {
    case 'set_business': {
      const name = str(a.name);
      const industry = str(a.industry);
      return name || industry ? { type: 'set-business', name, industry } : null;
    }
    case 'create_screen':
      return str(a.name) && ['web', 'native', 'chat'].includes(a.surface)
        ? { type: 'create-screen', name: a.name, surface: a.surface, blocks: (a.blocks ?? []).filter(isBlockKind) }
        : null;
    case 'remove_screen':
      return str(a.screen) ? { type: 'remove-screen', screenName: a.screen } : null;
    case 'add_block':
      return isBlockKind(a.block) ? { type: 'add-block', block: a.block, screenName: str(a.screen) } : null;
    case 'remove_block':
      return isBlockKind(a.block) ? { type: 'remove-block', block: a.block, screenName: str(a.screen) } : null;
    case 'set_props': {
      const props = cleanProps(a.props);
      return isBlockKind(a.block) && Object.keys(props).length > 0
        ? { type: 'set-props', block: a.block, screenName: str(a.screen), props }
        : null;
    }
    case 'rewrite_copy':
      return { type: 'rewrite-copy', screenName: str(a.screen), force: a.force === true };
    case 'set_voice':
      return a.tone || typeof a.emoji === 'boolean'
        ? { type: 'set-voice', tone: a.tone ?? undefined, emoji: typeof a.emoji === 'boolean' ? a.emoji : undefined }
        : null;
    case 'set_color':
      return /^#[0-9a-f]{3,8}$/i.test(a.value ?? '') && ['primary', 'background', 'ink'].includes(a.slot)
        ? { type: 'set-color', slot: a.slot, value: a.value.toUpperCase() }
        : null;
    case 'set_radius':
      return Number.isFinite(a.value) ? { type: 'set-radius', direction: 'set', value: a.value } : null;
    case 'set_density':
      return ['compact', 'comfortable', 'spacious'].includes(a.density) ? { type: 'set-density', density: a.density } : null;
    case 'set_shadow':
      return ['none', 'soft', 'pronounced'].includes(a.level) ? { type: 'set-shadow', level: a.level } : null;
    case 'set_font':
      return str(a.family) && ['display', 'body'].includes(a.slot)
        ? { type: 'set-font', slot: a.slot, family: a.family }
        : null;
    case 'audit':
      return { type: 'audit' };
    case 'fix_drift':
      return { type: 'fix-drift' };
    case 'undo':
      return { type: 'undo' };
    default:
      return null;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Ask the LLM brain. Throws on any failure — the caller falls back to the
 * deterministic parser.
 */
export async function askBrain(state: StudioState, input: string): Promise<BrainResult> {
  const recent = state.messages.slice(-8).map((m) => ({ role: m.role, text: m.text.slice(0, 500) }));
  const res = await fetch(BRAIN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input, state: summarize(state), recent }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`brain ${res.status}`);
  const data = await res.json();
  const intents = (Array.isArray(data.actions) ? data.actions : [])
    .map(toIntent)
    .filter((i: Intent | null): i is Intent => i !== null);
  return { reply: typeof data.reply === 'string' ? data.reply : '', intents };
}

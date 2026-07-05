import { TokenSet } from '../felix/tokens';

/** The surfaces a product ships on. Each renders as its own kind of frame. */
export type SurfaceType = 'web' | 'native' | 'chat';

/** Who the product is for — the copywriter generates all content from this. */
export interface Business {
  /** Brand name, e.g. "Fieldnote". */
  name: string;
  /** Freeform industry description, e.g. "dental clinic". */
  industry: string;
}

/** A block is a section of a screen, composed from Felix primitives. */
export type BlockKind =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'stats'
  | 'form'
  | 'pricing'
  | 'testimonial'
  | 'table'
  | 'cta'
  | 'footer';

/** Content props — every visible string on the canvas lives here, not in code. */
export interface BlockProps {
  // navbar / footer
  brand?: string;
  links?: string[];
  ctaLabel?: string;
  fineprint?: string;
  // hero / cta
  badge?: string;
  headline?: string;
  subhead?: string;
  primaryCta?: string;
  secondaryCta?: string;
  // features
  items?: { title: string; body: string }[];
  // stats
  stats?: { label: string; value: string; delta?: string }[];
  // form
  title?: string;
  fields?: { label: string; placeholder: string; type?: string }[];
  submitLabel?: string;
  footnote?: string;
  // pricing
  tiers?: { name: string; price: string; blurb: string; cta: string; featured?: boolean }[];
  // testimonial
  quote?: string;
  author?: string;
  role?: string;
  // table
  columns?: string[];
  rows?: { cells: string[]; badge?: { label: string; tone: 'positive' | 'warning' | 'neutral' | 'danger' } }[];
}

export interface Block {
  id: string;
  kind: BlockKind;
  props: BlockProps;
  /**
   * Ad-hoc style overrides applied outside the token system. Kept as an
   * explicit escape hatch so the drift audit has something real to catch.
   */
  overrides?: { background?: string; radius?: number };
}

/** One node in a chat flow: a bot message plus quick replies that jump on. */
export interface ChatStep {
  id: string;
  name: string;
  message: string;
  replies: { label: string; goTo?: string }[];
}

/**
 * A frame on the canvas. Web and native screens compose blocks; chat screens
 * are flows composed of steps.
 */
export interface Screen {
  id: string;
  name: string;
  surface: SurfaceType;
  blocks: Block[];
  steps: ChatStep[];
  /** Position of the frame on the infinite canvas. */
  x: number;
  y: number;
}

export type Selection =
  | { kind: 'none' }
  | { kind: 'screen'; screenId: string }
  | { kind: 'block'; screenId: string; blockId: string }
  | { kind: 'step'; screenId: string; stepId: string };

export interface ChangelogEntry {
  id: string;
  /** Sequence number, newest = highest. */
  seq: number;
  summary: string;
  detail?: string;
  kind: 'token' | 'screen' | 'brand' | 'revert' | 'seed';
  /** Snapshot taken BEFORE the change, used for revert. */
  before: { tokens: TokenSet; screens: Screen[]; business: Business };
}

export interface Message {
  id: string;
  role: 'designer' | 'felix';
  text: string;
  /** Optional structured payload rendered under the message. */
  audit?: AuditFinding[];
}

export interface AuditFinding {
  severity: 'issue' | 'warning' | 'ok';
  title: string;
  detail: string;
}

export interface StudioState {
  business: Business;
  tokens: TokenSet;
  screens: Screen[];
  selection: Selection;
  messages: Message[];
  changelog: ChangelogEntry[];
}

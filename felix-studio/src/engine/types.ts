import { TokenSet } from '../felix/tokens';

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

export interface Block {
  id: string;
  kind: BlockKind;
  /**
   * Ad-hoc style overrides applied outside the token system. Kept as an
   * explicit escape hatch so the drift audit has something real to catch.
   */
  overrides?: { background?: string; radius?: number };
}

export interface Screen {
  id: string;
  name: string;
  blocks: Block[];
  /** Position of the frame on the infinite canvas. */
  x: number;
  y: number;
}

export type Selection =
  | { kind: 'none' }
  | { kind: 'screen'; screenId: string }
  | { kind: 'block'; screenId: string; blockId: string };

export interface ChangelogEntry {
  id: string;
  /** Sequence number, newest = highest. */
  seq: number;
  summary: string;
  detail?: string;
  kind: 'token' | 'screen' | 'revert' | 'seed';
  /** Snapshot taken BEFORE the change, used for revert. */
  before: { tokens: TokenSet; screens: Screen[] };
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
  tokens: TokenSet;
  screens: Screen[];
  selection: Selection;
  messages: Message[];
  changelog: ChangelogEntry[];
}

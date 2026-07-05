/**
 * Client side of the collaboration layer. Connects to the local sync server
 * (server/index.mjs), keeps the shared document in step, and relays presence.
 * If no server is reachable — e.g. the hosted demo, or `npm run dev` without
 * `npm run server` — the studio degrades gracefully to solo mode and keeps
 * persisting to localStorage as before.
 */
import { Selection, StudioState } from './types';

/** The shared document — everything that belongs to the team, not the tab. */
export interface SyncDoc {
  business: StudioState['business'];
  tokens: StudioState['tokens'];
  screens: StudioState['screens'];
  messages: StudioState['messages'];
  changelog: StudioState['changelog'];
}

export function extractDoc(state: StudioState): SyncDoc {
  return {
    business: state.business,
    tokens: state.tokens,
    screens: state.screens,
    messages: state.messages,
    changelog: state.changelog,
  };
}

export interface Peer {
  id: string;
  name: string;
  color: string;
  selection: Selection | null;
  cursor: { x: number; y: number } | null;
}

export type SyncStatus = 'connecting' | 'live' | 'solo';

export interface Identity {
  id: string;
  name: string;
  color: string;
}

const NAMES = ['Wren', 'Otter', 'Heron', 'Juniper', 'Marlin', 'Sable', 'Ibis', 'Larch'];
const COLORS = ['#E0662D', '#2E7D7B', '#6D4FC2', '#B0468F', '#3D87C2', '#3D8361', '#B98A21', '#B4453A'];

/** Stable name/color per browser; unique id per tab so two tabs are two peers. */
export function loadIdentity(): Identity {
  let name: string, color: string;
  try {
    const raw = localStorage.getItem('felix-studio-identity');
    if (raw) {
      ({ name, color } = JSON.parse(raw));
    } else {
      const pick = Math.floor(Math.random() * NAMES.length);
      name = NAMES[pick];
      color = COLORS[pick];
      localStorage.setItem('felix-studio-identity', JSON.stringify({ name, color }));
    }
  } catch {
    name = 'Guest';
    color = '#888888';
  }
  let tab: string | null = null;
  try {
    tab = sessionStorage.getItem('felix-studio-tab');
    if (!tab) {
      tab = Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem('felix-studio-tab', tab);
    }
  } catch {
    tab = Math.random().toString(36).slice(2, 8);
  }
  return { id: `${name.toLowerCase()}-${tab}`, name, color };
}

export function currentRoom(): string {
  const hash = window.location.hash.replace(/^#/, '').trim();
  return hash || 'studio';
}

interface SyncCallbacks {
  /** A newer document arrived from another client (or the server on join). */
  onRemoteDoc: (doc: SyncDoc) => void;
  /** The room is brand new — the server wants our current state as the seed. */
  onSeedRequest: () => void;
  onPeers: (peers: Peer[]) => void;
  onStatus: (status: SyncStatus) => void;
}

const SERVER_URL = `ws://${window.location.hostname}:8787`;
const RETRY_MS = 4000;
const MAX_RETRIES = 3; // then settle into solo mode; a page reload retries again

export class FelixSync {
  private ws: WebSocket | null = null;
  private readonly identity: Identity;
  private readonly room: string;
  private readonly cb: SyncCallbacks;
  private retries = 0;
  private closed = false;
  private joined = false;
  private cursorPending: { x: number; y: number } | null | undefined = undefined;
  private cursorTimer: number | null = null;

  constructor(room: string, identity: Identity, cb: SyncCallbacks) {
    this.room = room;
    this.identity = identity;
    this.cb = cb;
    this.connect();
  }

  private connect() {
    if (this.closed) return;
    this.cb.onStatus(this.retries === 0 ? 'connecting' : 'connecting');
    let ws: WebSocket;
    try {
      ws = new WebSocket(SERVER_URL);
    } catch {
      this.cb.onStatus('solo');
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this.retries = 0;
      ws.send(JSON.stringify({ type: 'join', room: this.room, client: this.identity }));
    };

    ws.onmessage = (event) => {
      let msg: { type: string; doc?: SyncDoc | null; peers?: Peer[] };
      try {
        msg = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (msg.type === 'init') {
        this.joined = true;
        this.cb.onStatus('live');
        if (msg.doc) this.cb.onRemoteDoc(msg.doc);
        else this.cb.onSeedRequest();
        return;
      }
      if (msg.type === 'doc' && msg.doc) {
        this.cb.onRemoteDoc(msg.doc);
        return;
      }
      if (msg.type === 'peers' && msg.peers) {
        this.cb.onPeers(msg.peers.filter((p) => p.id !== this.identity.id));
        return;
      }
    };

    ws.onclose = () => {
      this.joined = false;
      this.cb.onPeers([]);
      if (this.closed) return;
      this.retries += 1;
      if (this.retries > MAX_RETRIES) {
        this.cb.onStatus('solo');
        return;
      }
      this.cb.onStatus('connecting');
      window.setTimeout(() => this.connect(), RETRY_MS);
    };

    ws.onerror = () => {
      // onclose follows and handles retry/solo
    };
  }

  get live(): boolean {
    return this.joined && this.ws?.readyState === WebSocket.OPEN;
  }

  sendDoc(doc: SyncDoc) {
    if (!this.live) return;
    this.ws!.send(JSON.stringify({ type: 'update', doc }));
  }

  sendSelection(selection: Selection) {
    if (!this.live) return;
    this.ws!.send(JSON.stringify({ type: 'presence', selection }));
  }

  /** Cursor moves are throttled — at most one message per 40ms. */
  sendCursor(cursor: { x: number; y: number } | null) {
    this.cursorPending = cursor;
    if (this.cursorTimer !== null) return;
    this.cursorTimer = window.setTimeout(() => {
      this.cursorTimer = null;
      if (this.cursorPending === undefined || !this.live) return;
      this.ws!.send(JSON.stringify({ type: 'presence', cursor: this.cursorPending }));
      this.cursorPending = undefined;
    }, 40);
  }

  close() {
    this.closed = true;
    this.ws?.close();
  }
}

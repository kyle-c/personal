/**
 * Felix Studio sync server — persistence and collaboration for local use.
 *
 *   node server/index.mjs        (defaults to port 8787)
 *
 * Model: server-authoritative, last-writer-wins. Each room holds one product
 * document ({business, tokens, screens, messages, changelog}). Clients send
 * whole-document updates; the server versions them, persists to disk, and
 * broadcasts to the other clients in the room. Presence (who's here, what
 * they've selected, where their cursor is) is relayed live and never stored.
 *
 * This is deliberately the simplest thing that makes the studio multiplayer.
 * The upgrade path is CRDTs (Yjs) behind the same message shapes.
 */
import { mkdirSync, readFileSync, writeFileSync, renameSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT ?? 8787);
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), 'data');
mkdirSync(DATA_DIR, { recursive: true });

const safe = (room) => room.replace(/[^a-z0-9-_]/gi, '_').slice(0, 64) || 'studio';

/** room -> { version, doc, clients: Map<ws, peer>, saveTimer } */
const rooms = new Map();

function loadRoom(name) {
  if (rooms.has(name)) return rooms.get(name);
  let version = 0;
  let doc = null;
  try {
    const raw = readFileSync(join(DATA_DIR, `${safe(name)}.json`), 'utf8');
    const parsed = JSON.parse(raw);
    version = parsed.version ?? 0;
    doc = parsed.doc ?? null;
  } catch {
    // new room
  }
  const room = { name, version, doc, clients: new Map(), saveTimer: null };
  rooms.set(name, room);
  return room;
}

function persist(room) {
  clearTimeout(room.saveTimer);
  room.saveTimer = setTimeout(() => {
    try {
      const file = join(DATA_DIR, `${safe(room.name)}.json`);
      const tmp = `${file}.tmp`;
      writeFileSync(tmp, JSON.stringify({ version: room.version, doc: room.doc }));
      renameSync(tmp, file); // atomic-ish: never leave a half-written file
    } catch (err) {
      console.error(`[felix-sync] failed to persist room "${room.name}":`, err.message);
    }
  }, 300);
}

function peersPayload(room) {
  return {
    type: 'peers',
    peers: [...room.clients.values()].map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      selection: p.selection ?? null,
      cursor: p.cursor ?? null,
    })),
  };
}

function broadcast(room, message, except) {
  const raw = JSON.stringify(message);
  for (const [ws] of room.clients) {
    if (ws !== except && ws.readyState === ws.OPEN) ws.send(raw);
  }
}

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  let room = null;

  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (msg.type === 'join' && msg.client?.id) {
      room = loadRoom(String(msg.room ?? 'studio'));
      room.clients.set(ws, {
        id: String(msg.client.id),
        name: String(msg.client.name ?? 'Guest').slice(0, 32),
        color: String(msg.client.color ?? '#888888'),
        selection: null,
        cursor: null,
      });
      ws.send(JSON.stringify({ type: 'init', version: room.version, doc: room.doc }));
      broadcast(room, peersPayload(room)); // includes the newcomer for everyone
      console.log(`[felix-sync] ${room.clients.get(ws).name} joined "${room.name}" (${room.clients.size} here)`);
      return;
    }

    if (!room) return;

    if (msg.type === 'update' && msg.doc) {
      room.version += 1;
      room.doc = msg.doc;
      persist(room);
      broadcast(room, { type: 'doc', version: room.version, doc: room.doc }, ws);
      return;
    }

    if (msg.type === 'presence') {
      const peer = room.clients.get(ws);
      if (!peer) return;
      if ('selection' in msg) peer.selection = msg.selection ?? null;
      if ('cursor' in msg) peer.cursor = msg.cursor ?? null;
      broadcast(room, peersPayload(room), ws);
      return;
    }
  });

  ws.on('close', () => {
    if (!room) return;
    const peer = room.clients.get(ws);
    room.clients.delete(ws);
    broadcast(room, peersPayload(room));
    if (peer) console.log(`[felix-sync] ${peer.name} left "${room.name}" (${room.clients.size} here)`);
  });
});

const saved = readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
console.log(`[felix-sync] listening on ws://localhost:${PORT}`);
console.log(`[felix-sync] data dir: ${DATA_DIR}${saved.length ? ` (${saved.length} saved room${saved.length === 1 ? '' : 's'})` : ''}`);

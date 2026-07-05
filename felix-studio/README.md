# Felix Studio

A working prototype of a **conversational design system**: a Figma-style studio
where product designers build and maintain a digital product — for **any
business**, across **multiple surfaces** (web, native app, WhatsApp) — by
talking to the design system itself.

```bash
cd felix-studio
npm install
npm run server   # terminal 1 — sync server (persistence + multiplayer)
npm run dev      # terminal 2 — the studio
```

Open the printed URL in two browser windows to see multiplayer. Without the
server, the studio runs solo on `localStorage` — everything else still works.

## The idea

A traditional design system is a reference — tokens, components, and docs that a
designer reads and then applies by hand. Felix Studio inverts that: the design
system is the **interlocutor**. You describe intent and the system executes it,
because it — not the designer's memory — holds the constraints.

Four principles drive the implementation:

1. **Tokens are the single source of truth.** Color, type, spacing, radius,
   shadow — *and voice* (tone, emoji), because conversational surfaces are
   styled by words the way visual surfaces are styled by color. Every surface
   derives from one `TokenSet` (`src/felix/tokens.ts`).
2. **Content is data, not code.** Every visible string lives in block props,
   written by the copywriter (`src/engine/copywriter.ts`) from a business
   profile. Say *"this is a dental clinic called Brightside"* and every
   headline, pricing tier, form and chat flow rewrites itself across all
   surfaces — structure and tokens stay put.
3. **The conversation is the contribution process.** Every change — spoken,
   or made directly in the inspectors — lands in a changelog with a snapshot
   and one-click revert.
4. **Maintenance is a dialogue.** The audit (`src/engine/audit.ts`) is
   surface-aware: token drift and WCAG contrast on visual surfaces; dead-end
   replies, missing human handoffs and over-long messages in chat flows; and
   **stale exports** — every export embeds a manifest fingerprint, the studio
   records it, and the audit flags shipped artifacts the product has moved
   past. Re-export to clear it.
5. **Human work is sacred.** Content you edit by hand (inspector fields, chat
   steps, or LLM rewrites you asked for) is marked hand-edited: rebrands,
   voice changes and copy rewrites preserve it and tell you what they kept.
   Say "rewrite everything including my edits" to overwrite, or "unlock" a
   section in the inspector.

## The LLM brain

With an API key, Felix's conversation is a real LLM (Claude, via the sync
server so the key never reaches the browser):

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run server     # brain ON
FELIX_MODEL=claude-sonnet-5 ... npm run server  # optional; default claude-opus-4-8
```

The brain (`server/brain.mjs`) gets the designer's message plus a compact
product summary and returns a reply and typed actions via structured outputs
— it can ask clarifying questions, resolve multi-turn context ("make *it*
darker"), warn about contrast, and write real copy into any block
(`set_props`). The client (`src/engine/brain.ts`) validates every action
before executing; the LLM proposes, the studio disposes. Opus 4.8 is the
default because the copy is the product — quality shows.

**Without a key, nothing breaks**: the deterministic parser
(`src/engine/parser.ts`) and copywriter (`src/engine/copywriter.ts`, seven
industry archetypes) handle the same conversation offline — that's also what
the hosted demo runs.

## Surfaces

Each frame on the canvas belongs to a surface, with its own rendering, audit
rules and **export format**:

| Surface | Frame | Blocks | Exports as |
| --- | --- | --- | --- |
| Web | Browser-width page | Responsive 3–4 col grids | Standalone HTML, tokens as `:root` CSS variables |
| App | Phone chrome (status bar, tab bar) | Same blocks, adapted: stacked grids, tables become cards, footer becomes a tab bar | React Native component with a `tokens` object |
| WhatsApp | Branded chat transcript | Flow steps: bot message + quick replies wired to other steps | Flow-definition JSON (steps, messages, quick replies, voice) |

Try: *"create an app screen for booking"*, *"create a whatsapp flow for
orders"*, then **Export** in the toolbar.

## The editor

- **Infinite canvas.** Scroll to pan, `⌘/Ctrl + scroll` to zoom, `Space`/hand
  tool to drag-pan, `Shift+1` to fit. Drag a frame's name label to move it.
- **Selection.** Click frames, sections, or chat bubbles (or use Layers,
  grouped by surface). `Esc` deselects, `Delete` removes, `⌘Z` undoes.
- **Right sidebar.** Context-sensitive: business profile + tokens + voice when
  nothing is selected; frame props for frames; content editors for sections
  (headline, quote, buttons…); message + quick-reply wiring for chat steps.
  Changelog and Audit tabs alongside.
- **Chat dock.** Felix floats over the canvas. Conversation and direct
  manipulation write to the same store, so both land in the changelog.

The Dashboard frame ships with one deliberately drifted block so the audit has
something real to find. "Reset demo" starts over.

## Persistence & collaboration

Running `npm run server` starts a small WebSocket server (`server/index.mjs`,
port 8787) that makes the studio multiplayer and durable:

- **Shared document.** Business profile, tokens, screens, changelog *and the
  Felix conversation* are one document per room, held authoritatively on the
  server, persisted to `server/data/<room>.json`, and streamed to everyone in
  the room. A new teammate joining an existing room receives the product as it
  stands — nothing lives only in a browser.
- **Rooms.** The URL hash is the room: `…/#spring-redesign`. No hash = the
  `studio` room. Each room is its own product.
- **Presence.** Live named cursors in your teammate's color, colored outlines
  on whatever frame / section / chat step they have selected, and an avatar
  stack with a connection indicator in the toolbar. Presence is relayed, never
  stored.
- **Conflict model.** Server-ordered last-writer-wins on the whole document —
  deliberately the simplest thing that works for a small team. The upgrade
  path is CRDTs (Yjs) behind the same message shapes, and the identity stub
  (`loadIdentity` in `src/engine/sync.ts`) is where real auth plugs in.
- **Offline.** No server (or a dropped connection after retries) degrades to
  solo mode on `localStorage`; the hosted demo runs this way permanently.

## A note on sources

This app was built against the concepts in
[kylecooney.com/conversational-design-system](https://kylecooney.com/conversational-design-system)
and the visual primitives of [felix-design.vercel.app](http://felix-design.vercel.app).
Both hosts were unreachable from the build environment (network egress policy),
so the token defaults in `src/felix/tokens.ts` are a placeholder rendition —
warm paper, ink, Crimson Pro display type — modeled on kylecooney.com. To adopt
the real Felix values, edit `DEFAULT_TOKENS` in that one file; nothing else
needs to change.

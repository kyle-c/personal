# Felix Studio

A working prototype of a **conversational design system**: a Figma-style studio
where product designers build and maintain a digital product — for **any
business**, across **multiple surfaces** (web, native app, WhatsApp) — by
talking to the design system itself.

```bash
cd felix-studio
npm install
npm run dev
```

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
   replies, missing human handoffs and over-long messages in chat flows.

## The LLM seam

The demo is fully deterministic and offline — no API key. Two contracts mark
exactly where a real LLM slots in without touching anything downstream:

- **`parse(input): Intent`** (`src/engine/parser.ts`) — language → typed intent.
- **`generateBlockProps` / `generateFlowSteps`** (`src/engine/copywriter.ts`) —
  business profile + voice → content. The demo ships archetypes for
  food, health, fitness, hospitality, retail, agencies and a SaaS fallback.

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

State persists to `localStorage`; "Reset demo" starts over. The Dashboard frame
ships with one deliberately drifted block so the audit has something real to
find. Real persistence/collaboration is the next layer: the changelog is
already shaped like a commit log — it wants a backend, which this prototype
deliberately stops short of.

## A note on sources

This app was built against the concepts in
[kylecooney.com/conversational-design-system](https://kylecooney.com/conversational-design-system)
and the visual primitives of [felix-design.vercel.app](http://felix-design.vercel.app).
Both hosts were unreachable from the build environment (network egress policy),
so the token defaults in `src/felix/tokens.ts` are a placeholder rendition —
warm paper, ink, Crimson Pro display type — modeled on kylecooney.com. To adopt
the real Felix values, edit `DEFAULT_TOKENS` in that one file; nothing else
needs to change.

# Felix Studio

A working prototype of a **conversational design system**: a Figma-style studio
where product designers build and maintain a digital product by talking to the
design system itself, instead of hand-assembling screens from a static
component library.

```bash
cd felix-studio
npm install
npm run dev
```

## The idea

A traditional design system is a reference — tokens, components, and docs that a
designer reads and then applies by hand. Felix Studio inverts that: the design
system is the **interlocutor**. You describe intent ("create a pricing page",
"make everything rounder", "audit the product") and the system executes it,
because it — not the designer's memory — holds the constraints.

Three principles drive the implementation:

1. **Tokens are the single source of truth.** Every primitive and every screen
   reads token values through CSS custom properties (`src/felix/tokens.ts`).
   A one-sentence request restyles the entire product because nothing on the
   canvas owns its own styling.
2. **The conversation is the contribution process.** Every change — spoken or
   made directly in the token editor — lands in a changelog with a snapshot and
   one-click revert. The product's history is legible and reversible.
3. **Maintenance is a dialogue, not a chore.** The audit (`src/engine/audit.ts`)
   continuously checks for token drift (values that bypass the system), WCAG
   contrast failures, and structural gaps — and the fix is also conversational
   ("fix drift").

## What you can say

| Build | Restyle | Maintain |
| --- | --- | --- |
| "create a pricing page with a hero and pricing table" | "change the primary color to forest green" | "audit the product" |
| "add a signup form to the home page" | "set the background to #F4F1EA" | "fix drift" |
| "remove the footer" | "make everything rounder" / "radius 12px" | "undo" |
| "delete the dashboard page" | "more breathing room" / "make it compact" | revert any changelog entry |
|  | "use a serif for headings", "remove all shadows" |  |

The parser (`src/engine/parser.ts`) is deterministic and offline so the demo
needs no API key. In a production system an LLM grounded in the design system
would sit behind the same `Intent` contract.

## The editor

The studio is laid out like Figma:

- **Infinite canvas.** Every screen is a frame, all visible at once. Scroll to
  pan, `⌘/Ctrl + scroll` to zoom, `Space` or the hand tool (`H`) to drag-pan,
  `Shift+1` / toolbar to zoom-to-fit. Drag a frame's name label to move it.
- **Selection.** Click a frame or any section inside it (or use the Layers
  panel). `Esc` deselects, `Delete` removes the selection, `⌘Z` undoes.
- **Left sidebar.** *Layers* (frames and their sections, with drift warnings)
  and *Assets* (the Felix primitives rendered live from current tokens).
- **Right sidebar.** *Design* is context-sensitive — global tokens when nothing
  is selected, frame properties (rename, delete) for a selected frame, section
  properties (reorder, fix drift, delete) for a selected section — plus
  *Changelog* (with per-entry revert) and *Audit* (live health report).
- **Chat dock.** Felix floats over the canvas, Figma-AI style. Conversation and
  direct manipulation write to the same store, so both land in the changelog.

State persists to `localStorage`; "Reset demo" starts over. The Dashboard
frame ships with one deliberately drifted block so the audit has something
real to find.

## A note on sources

This app was built against the concepts in
[kylecooney.com/conversational-design-system](https://kylecooney.com/conversational-design-system)
and the visual primitives of [felix-design.vercel.app](http://felix-design.vercel.app).
Both hosts were unreachable from the build environment (network egress policy),
so the token defaults in `src/felix/tokens.ts` are a placeholder rendition —
warm paper, ink, Crimson Pro display type — modeled on kylecooney.com. To adopt
the real Felix values, edit `DEFAULT_TOKENS` in that one file; nothing else
needs to change.

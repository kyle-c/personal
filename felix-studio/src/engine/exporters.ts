/**
 * Exporters: the studio's output stage. Each surface compiles to a real,
 * deployable artifact — a standalone HTML page for web, a React Native
 * component for app screens, and a WhatsApp-style flow definition for chat.
 * All of them derive their styling from the same token set.
 */
import { bestTextOn, hexWithAlpha, TokenSet } from '../felix/tokens';
import { Block, Screen, StudioState } from './types';

const esc = (s: string | undefined) =>
  (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export interface ExportArtifact {
  filename: string;
  language: 'html' | 'jsx' | 'json';
  code: string;
}

export function exportScreen(state: StudioState, screen: Screen): ExportArtifact {
  if (screen.surface === 'chat') return exportChatFlow(state, screen);
  if (screen.surface === 'native') return exportNative(state, screen);
  return exportWeb(state, screen);
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------------------------------------------------------------------------
// Web → standalone HTML
// ---------------------------------------------------------------------------

function cssVars(t: TokenSet): string {
  const density = { compact: 0.75, comfortable: 1, spacious: 1.4 }[t.space.density];
  const u = t.space.unit * density;
  return [
    `  --primary: ${t.color.primary};`,
    `  --on-primary: ${bestTextOn(t.color.primary)};`,
    `  --primary-soft: ${hexWithAlpha(t.color.primary, 0.12)};`,
    `  --ink: ${t.color.ink};`,
    `  --background: ${t.color.background};`,
    `  --surface: ${t.color.surface};`,
    `  --muted: ${t.color.muted};`,
    `  --border: ${t.color.border};`,
    `  --font-display: ${t.typography.displayFamily};`,
    `  --font-body: ${t.typography.bodyFamily};`,
    `  --space: ${u}px;`,
    `  --radius: ${t.radius.base}px;`,
  ].join('\n');
}

function blockHtml(b: Block): string {
  const p = b.props;
  switch (b.kind) {
    case 'navbar':
      return `  <nav class="nav">
    <strong>${esc(p.brand)}</strong>
    <div>${(p.links ?? []).map((l) => `<a href="#${slug(l)}">${esc(l)}</a>`).join(' ')}
      <button class="btn">${esc(p.ctaLabel)}</button>
    </div>
  </nav>`;
    case 'hero':
      return `  <header class="hero">
    ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}
    <h1>${esc(p.headline)}</h1>
    <p>${esc(p.subhead)}</p>
    <p><button class="btn">${esc(p.primaryCta)}</button> <button class="btn secondary">${esc(p.secondaryCta)}</button></p>
  </header>`;
    case 'features':
      return `  <section class="grid cols-3">
${(p.items ?? []).map((i) => `    <div class="card"><h3>${esc(i.title)}</h3><p class="muted">${esc(i.body)}</p></div>`).join('\n')}
  </section>`;
    case 'stats':
      return `  <section class="grid cols-4">
${(p.stats ?? []).map((s) => `    <div class="card"><div class="muted small">${esc(s.label)}</div><div class="stat">${esc(s.value)}</div>${s.delta ? `<div class="small">${esc(s.delta)}</div>` : ''}</div>`).join('\n')}
  </section>`;
    case 'form':
      return `  <section class="center">
    <form class="card form">
      <h2>${esc(p.title)}</h2>
${(p.fields ?? []).map((f) => `      <label>${esc(f.label)}<input type="${esc(f.type ?? 'text')}" placeholder="${esc(f.placeholder)}"></label>`).join('\n')}
      <button class="btn" type="submit">${esc(p.submitLabel)}</button>
      ${p.footnote ? `<p class="muted small">${esc(p.footnote)}</p>` : ''}
    </form>
  </section>`;
    case 'pricing':
      return `  <section class="grid cols-3">
${(p.tiers ?? []).map((t) => `    <div class="card${t.featured ? ' featured' : ''}"><h3>${esc(t.name)}</h3><div class="stat">${esc(t.price)}</div><p class="muted small">${esc(t.blurb)}</p><button class="btn${t.featured ? '' : ' secondary'}">${esc(t.cta)}</button></div>`).join('\n')}
  </section>`;
    case 'testimonial':
      return `  <section class="center">
    <figure class="card quote"><blockquote>${esc(p.quote)}</blockquote><figcaption>${esc(p.author)} — <span class="muted">${esc(p.role)}</span></figcaption></figure>
  </section>`;
    case 'table':
      return `  <section>
    <table class="card table">
      <thead><tr>${(p.columns ?? []).map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>
${(p.rows ?? []).map((r) => `        <tr>${r.cells.map((c) => `<td>${esc(c)}</td>`).join('')}${r.badge ? `<td><span class="badge">${esc(r.badge.label)}</span></td>` : ''}</tr>`).join('\n')}
      </tbody>
    </table>
  </section>`;
    case 'cta':
      return `  <section class="cta card">
    <h2>${esc(p.headline)}</h2>
    <p class="muted">${esc(p.subhead)}</p>
    <button class="btn">${esc(p.primaryCta)}</button>
  </section>`;
    case 'footer':
      return `  <footer class="footer">
    <span class="muted small">${esc(p.fineprint)}</span>
    <div>${(p.links ?? []).map((l) => `<a href="#${slug(l)}">${esc(l)}</a>`).join(' ')}</div>
  </footer>`;
  }
}

function exportWeb(state: StudioState, screen: Screen): ExportArtifact {
  const code = `<!doctype html>
<!-- ${screen.name} — generated by Felix Studio for ${state.business.name}. Tokens are the single source of truth: edit :root, restyle everything. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(state.business.name)} — ${esc(screen.name)}</title>
<style>
:root {
${cssVars(state.tokens)}
}
* { box-sizing: border-box; margin: 0; }
body { background: var(--background); color: var(--ink); font-family: var(--font-body); line-height: 1.6; }
h1, h2, h3 { font-family: var(--font-display); line-height: 1.15; }
h1 { font-size: 2.4rem; }
a { color: var(--muted); text-decoration: none; margin-right: calc(var(--space) * 1.5); }
.nav, .footer { display: flex; justify-content: space-between; align-items: center; padding: calc(var(--space) * 1.5) calc(var(--space) * 4); background: var(--surface); border-bottom: 1px solid var(--border); }
.footer { border-top: 1px solid var(--border); border-bottom: 0; }
.hero { text-align: center; padding: calc(var(--space) * 6) calc(var(--space) * 4) calc(var(--space) * 4); }
.hero p { max-width: 52ch; margin: calc(var(--space) * 1.5) auto; color: var(--muted); }
.btn { background: var(--primary); color: var(--on-primary); font: 600 1rem var(--font-body); border: 1px solid transparent; border-radius: var(--radius); padding: var(--space) calc(var(--space) * 2); cursor: pointer; }
.btn.secondary { background: var(--surface); color: var(--ink); border-color: var(--border); }
.badge { display: inline-block; background: var(--primary-soft); color: var(--primary); font: 600 0.85rem var(--font-body); border-radius: 999px; padding: calc(var(--space) * 0.4) var(--space); }
.grid { display: grid; gap: calc(var(--space) * 2); padding: calc(var(--space) * 4); }
.cols-3 { grid-template-columns: repeat(3, 1fr); }
.cols-4 { grid-template-columns: repeat(4, 1fr); }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: calc(var(--radius) * 2); padding: calc(var(--space) * 3); }
.card.featured { border: 2px solid var(--primary); }
.center { display: flex; justify-content: center; padding: calc(var(--space) * 4); }
.form { width: 100%; max-width: 420px; display: grid; gap: calc(var(--space) * 1.5); }
.form input { width: 100%; font: 1rem var(--font-body); padding: var(--space); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
.quote { max-width: 560px; text-align: center; }
.table { width: calc(100% - var(--space) * 8); margin: calc(var(--space) * 4); border-collapse: collapse; padding: 0; }
.table th, .table td { text-align: left; padding: calc(var(--space) * 1.5); border-bottom: 1px solid var(--border); }
.cta { margin: calc(var(--space) * 4); text-align: center; background: var(--primary-soft); border-color: transparent; }
.stat { font-family: var(--font-display); font-size: 1.8rem; }
.muted { color: var(--muted); }
.small { font-size: 0.85rem; }
@media (max-width: 720px) { .cols-3, .cols-4 { grid-template-columns: 1fr; } }
</style>
</head>
<body>
${screen.blocks.map(blockHtml).join('\n')}
</body>
</html>
`;
  return { filename: `${slug(screen.name)}.html`, language: 'html', code };
}

// ---------------------------------------------------------------------------
// Native → React Native component
// ---------------------------------------------------------------------------

function nativeBlockJsx(b: Block): string {
  const p = b.props;
  const t = (s?: string) => JSON.stringify(s ?? '');
  switch (b.kind) {
    case 'navbar':
      return `      <View style={s.header}><Text style={s.brand}>${esc(p.brand)}</Text></View>`;
    case 'hero':
      return `      <View style={s.hero}>
        <Text style={s.h1}>${esc(p.headline)}</Text>
        <Text style={s.muted}>${esc(p.subhead)}</Text>
        <Pressable style={s.btn}><Text style={s.btnText}>${esc(p.primaryCta)}</Text></Pressable>
      </View>`;
    case 'features':
      return (p.items ?? [])
        .map(
          (i) => `      <View style={s.card}><Text style={s.h3}>${esc(i.title)}</Text><Text style={s.muted}>${esc(i.body)}</Text></View>`,
        )
        .join('\n');
    case 'stats':
      return `      <View style={s.statRow}>
${(p.stats ?? []).map((st) => `        <View style={s.statCard}><Text style={s.muted}>${esc(st.label)}</Text><Text style={s.stat}>${esc(st.value)}</Text></View>`).join('\n')}
      </View>`;
    case 'form':
      return `      <View style={s.card}>
        <Text style={s.h3}>${esc(p.title)}</Text>
${(p.fields ?? []).map((f) => `        <TextInput style={s.input} placeholder=${t(f.placeholder)} />`).join('\n')}
        <Pressable style={s.btn}><Text style={s.btnText}>${esc(p.submitLabel)}</Text></Pressable>
      </View>`;
    case 'pricing':
      return (p.tiers ?? [])
        .map(
          (tier) => `      <View style={[s.card${tier.featured ? ', s.featured' : ''}]}><Text style={s.h3}>${esc(tier.name)}</Text><Text style={s.stat}>${esc(tier.price)}</Text><Text style={s.muted}>${esc(tier.blurb)}</Text></View>`,
        )
        .join('\n');
    case 'testimonial':
      return `      <View style={s.card}><Text style={s.body}>${esc(p.quote)}</Text><Text style={s.muted}>${esc(p.author)} — ${esc(p.role)}</Text></View>`;
    case 'table':
      return (p.rows ?? [])
        .map(
          (r) => `      <View style={s.card}><Text style={s.body}>${esc(r.cells[0])}</Text><Text style={s.muted}>${esc(r.cells.slice(1).join(' · '))}${r.badge ? ` · ${esc(r.badge.label)}` : ''}</Text></View>`,
        )
        .join('\n');
    case 'cta':
      return `      <View style={s.cta}>
        <Text style={s.h3}>${esc(p.headline)}</Text>
        <Text style={s.muted}>${esc(p.subhead)}</Text>
        <Pressable style={s.btn}><Text style={s.btnText}>${esc(p.primaryCta)}</Text></Pressable>
      </View>`;
    case 'footer':
      return `      <Text style={[s.muted, s.center]}>${esc(p.fineprint)}</Text>`;
  }
}

function exportNative(state: StudioState, screen: Screen): ExportArtifact {
  const tk = state.tokens;
  const name = screen.name.replace(/[^A-Za-z0-9]/g, '') || 'Screen';
  const code = `// ${screen.name} — generated by Felix Studio for ${state.business.name}.
// Styling derives from Felix tokens; change the tokens object, restyle the screen.
import { Pressable, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';

export const tokens = {
  primary: '${tk.color.primary}',
  onPrimary: '${bestTextOn(tk.color.primary)}',
  ink: '${tk.color.ink}',
  background: '${tk.color.background}',
  surface: '${tk.color.surface}',
  muted: '${tk.color.muted}',
  border: '${tk.color.border}',
  space: ${tk.space.unit},
  radius: ${tk.radius.base},
};

export default function ${name}Screen() {
  return (
    <ScrollView style={s.screen}>
${screen.blocks.map(nativeBlockJsx).join('\n')}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { backgroundColor: tokens.background, flex: 1 },
  header: { padding: tokens.space * 2, backgroundColor: tokens.surface, borderBottomWidth: 1, borderColor: tokens.border },
  brand: { fontSize: 18, fontWeight: '700', color: tokens.ink },
  hero: { padding: tokens.space * 3, alignItems: 'center', gap: tokens.space },
  h1: { fontSize: 26, fontWeight: '600', color: tokens.ink, textAlign: 'center' },
  h3: { fontSize: 17, fontWeight: '600', color: tokens.ink },
  body: { fontSize: 15, color: tokens.ink },
  muted: { fontSize: 13, color: tokens.muted },
  center: { textAlign: 'center', padding: tokens.space * 2 },
  btn: { backgroundColor: tokens.primary, borderRadius: tokens.radius, paddingVertical: tokens.space, paddingHorizontal: tokens.space * 2, alignSelf: 'center', marginTop: tokens.space },
  btnText: { color: tokens.onPrimary, fontWeight: '600' },
  card: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: tokens.radius * 2, padding: tokens.space * 2, margin: tokens.space, marginHorizontal: tokens.space * 2, gap: 4 },
  featured: { borderColor: tokens.primary, borderWidth: 2 },
  cta: { margin: tokens.space * 2, padding: tokens.space * 2, borderRadius: tokens.radius * 2, backgroundColor: tokens.primary + '20', alignItems: 'center', gap: 4 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', padding: tokens.space },
  statCard: { width: '46%', margin: '2%', backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: tokens.radius * 2, padding: tokens.space * 2 },
  stat: { fontSize: 22, fontWeight: '600', color: tokens.ink },
  input: { borderWidth: 1, borderColor: tokens.border, borderRadius: tokens.radius, padding: tokens.space, marginVertical: 4, backgroundColor: tokens.surface },
});
`;
  return { filename: `${name}Screen.tsx`, language: 'jsx', code };
}

// ---------------------------------------------------------------------------
// Chat → WhatsApp-style flow definition
// ---------------------------------------------------------------------------

function exportChatFlow(state: StudioState, screen: Screen): ExportArtifact {
  const flow = {
    _comment: `${screen.name} — generated by Felix Studio for ${state.business.name}. WhatsApp-style flow definition: steps, messages and quick replies. Voice tokens: ${state.tokens.voice.tone}${state.tokens.voice.emoji ? ' + emoji' : ''}.`,
    version: '1.0',
    business: {
      name: state.business.name,
      vertical: state.business.industry,
    },
    voice: state.tokens.voice,
    entry_step: screen.steps[0]?.id ?? null,
    steps: screen.steps.map((step) => ({
      id: step.id,
      name: step.name,
      message: {
        type: 'text',
        body: step.message,
      },
      quick_replies: step.replies.map((r) => ({
        title: r.label,
        next_step: r.goTo ?? null,
      })),
    })),
  };
  return {
    filename: `${slug(screen.name)}-flow.json`,
    language: 'json',
    code: JSON.stringify(flow, null, 2) + '\n',
  };
}

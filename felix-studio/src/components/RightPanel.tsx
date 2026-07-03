import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  History,
  Palette,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Wand2,
} from 'lucide-react';
import { TokenSet } from '../felix/tokens';
import { runAudit } from '../engine/audit';
import { BLOCK_LABELS, useStudio } from '../engine/store';

type Tab = 'design' | 'changelog' | 'audit';

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 first:mt-0">
      {children}
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-[13px] text-stone-700">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] text-stone-400">{value.toUpperCase()}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-8 cursor-pointer rounded border border-stone-300 bg-transparent p-0"
          aria-label={`${label} color`}
        />
      </div>
    </div>
  );
}

/** Token editors — shown when nothing on the canvas is selected. */
function TokensPane() {
  const { state, dispatch } = useStudio();
  const t = state.tokens;

  const update = (summary: string, mutate: (draft: TokenSet) => void) => {
    const draft: TokenSet = JSON.parse(JSON.stringify(t));
    mutate(draft);
    dispatch({ type: 'set-tokens-direct', tokens: draft, summary });
  };

  return (
    <div className="px-3 py-3">
      <p className="mb-1 text-[11px] leading-relaxed text-stone-400">
        Nothing selected — these are the product-wide tokens, the single source of
        truth. Edit here or just ask Felix.
      </p>

      <SectionLabel>Color</SectionLabel>
      <ColorRow label="Primary" value={t.color.primary} onChange={(v) => update('Changed primary color', (d) => { d.color.primary = v; })} />
      <ColorRow label="Ink" value={t.color.ink} onChange={(v) => update('Changed ink color', (d) => { d.color.ink = v; })} />
      <ColorRow label="Background" value={t.color.background} onChange={(v) => update('Changed background color', (d) => { d.color.background = v; })} />
      <ColorRow label="Surface" value={t.color.surface} onChange={(v) => update('Changed surface color', (d) => { d.color.surface = v; })} />

      <SectionLabel>Shape</SectionLabel>
      <div className="flex items-center justify-between gap-3 py-1">
        <span className="text-[13px] text-stone-700">Corner radius</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={24}
            step={2}
            value={t.radius.base}
            onChange={(e) => update('Adjusted corner radius', (d) => { d.radius.base = Number(e.target.value); })}
            className="w-24 accent-stone-700"
          />
          <span className="w-9 text-right font-mono text-[11px] text-stone-400">{t.radius.base}px</span>
        </div>
      </div>

      <SectionLabel>Rhythm</SectionLabel>
      <div className="flex items-center justify-between py-1">
        <span className="text-[13px] text-stone-700">Density</span>
        <div className="flex gap-1">
          {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
            <button
              key={d}
              onClick={() => update(`Set spacing density to ${d}`, (dr) => { dr.space.density = d; })}
              className={
                t.space.density === d
                  ? 'rounded-md bg-stone-800 px-1.5 py-1 text-[10px] font-medium text-white'
                  : 'rounded-md border border-stone-200 px-1.5 py-1 text-[10px] text-stone-500 hover:border-stone-400'
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <SectionLabel>Depth</SectionLabel>
      <div className="flex items-center justify-between py-1">
        <span className="text-[13px] text-stone-700">Shadows</span>
        <div className="flex gap-1">
          {(['none', 'soft', 'pronounced'] as const).map((s) => (
            <button
              key={s}
              onClick={() => update(`Set shadows to ${s}`, (d) => { d.shadow.level = s; })}
              className={
                t.shadow.level === s
                  ? 'rounded-md bg-stone-800 px-1.5 py-1 text-[10px] font-medium text-white'
                  : 'rounded-md border border-stone-200 px-1.5 py-1 text-[10px] text-stone-500 hover:border-stone-400'
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <SectionLabel>Typography</SectionLabel>
      <div className="space-y-1 py-1">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-stone-700">Display</span>
          <span className="max-w-[55%] truncate text-right font-mono text-[11px] text-stone-400">
            {t.typography.displayFamily.split(',')[0].replace(/"/g, '')}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-stone-700">Body</span>
          <span className="max-w-[55%] truncate text-right font-mono text-[11px] text-stone-400">
            {t.typography.bodyFamily.split(',')[0].replace(/"/g, '')}
          </span>
        </div>
        <p className="pt-1 text-[11px] text-stone-400">
          Change with e.g. “use a serif for headings”.
        </p>
      </div>
    </div>
  );
}

/** Frame properties — shown when a screen is selected. */
function ScreenPane({ screenId }: { screenId: string }) {
  const { state, dispatch } = useStudio();
  const screen = state.screens.find((s) => s.id === screenId);
  const [name, setName] = useState(screen?.name ?? '');
  if (!screen) return null;
  return (
    <div className="px-3 py-3">
      <SectionLabel>Frame</SectionLabel>
      <label className="block">
        <span className="mb-1 block text-[11px] text-stone-400">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => dispatch({ type: 'rename-screen', screenId, name })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-[13px] text-stone-800 focus:border-blue-500 focus:outline-none"
        />
      </label>
      <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
        <span>Position</span>
        <span className="font-mono">
          {Math.round(screen.x)}, {Math.round(screen.y)}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-stone-400">
        <span>Sections</span>
        <span className="font-mono">{screen.blocks.length}</span>
      </div>

      <SectionLabel>Actions</SectionLabel>
      <button
        onClick={() =>
          dispatch({ type: 'converse', input: `delete the ${screen.name.toLowerCase()} page` })
        }
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-red-200 px-2 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-50"
      >
        <Trash2 size={12} />
        Delete frame
      </button>
      <p className="mt-3 text-[11px] leading-relaxed text-stone-400">
        Add sections conversationally — “add a testimonial to the{' '}
        {screen.name.toLowerCase()} page”. Drag the frame’s name label to move it on
        the canvas.
      </p>
    </div>
  );
}

/** Block properties — shown when a section inside a frame is selected. */
function BlockPane({ screenId, blockId }: { screenId: string; blockId: string }) {
  const { state, dispatch } = useStudio();
  const screen = state.screens.find((s) => s.id === screenId);
  const block = screen?.blocks.find((b) => b.id === blockId);
  if (!screen || !block) return null;
  const idx = screen.blocks.indexOf(block);
  return (
    <div className="px-3 py-3">
      <SectionLabel>Section</SectionLabel>
      <div className="flex items-center justify-between py-0.5 text-[13px]">
        <span className="text-stone-700">Type</span>
        <span className="capitalize text-stone-500">{BLOCK_LABELS[block.kind]}</span>
      </div>
      <div className="flex items-center justify-between py-0.5 text-[13px]">
        <span className="text-stone-700">Frame</span>
        <span className="text-stone-500">{screen.name}</span>
      </div>

      <SectionLabel>Arrange</SectionLabel>
      <div className="flex gap-1.5">
        <button
          disabled={idx === 0}
          onClick={() => dispatch({ type: 'shift-block', screenId, blockId, dir: -1 })}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border border-stone-200 px-2 py-1.5 text-xs text-stone-600 transition-colors hover:border-stone-400 disabled:opacity-40"
        >
          <ArrowUp size={12} /> Move up
        </button>
        <button
          disabled={idx === screen.blocks.length - 1}
          onClick={() => dispatch({ type: 'shift-block', screenId, blockId, dir: 1 })}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border border-stone-200 px-2 py-1.5 text-xs text-stone-600 transition-colors hover:border-stone-400 disabled:opacity-40"
        >
          <ArrowDown size={12} /> Move down
        </button>
      </div>

      {block.overrides && (
        <>
          <SectionLabel>Token Drift</SectionLabel>
          <div className="rounded-md border border-amber-200 bg-amber-50/60 px-2.5 py-2 text-[11px] leading-relaxed text-amber-900">
            This section carries hard-coded overrides that bypass the token system:{' '}
            <span className="font-mono">
              {Object.entries(block.overrides).map(([k, v]) => `${k}: ${v}`).join(', ')}
            </span>
          </div>
          <button
            onClick={() => dispatch({ type: 'clear-overrides', screenId, blockId })}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-stone-800 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-700"
          >
            <Wand2 size={12} />
            Snap back to tokens
          </button>
        </>
      )}

      <SectionLabel>Actions</SectionLabel>
      <button
        onClick={() => dispatch({ type: 'delete-block', screenId, blockId })}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-red-200 px-2 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-50"
      >
        <Trash2 size={12} />
        Delete section
      </button>
    </div>
  );
}

function ChangelogTab() {
  const { state, dispatch } = useStudio();
  if (state.changelog.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-[13px] text-stone-400">
        No changes yet. Everything you and Felix do together will be recorded here,
        each with a one-click revert.
      </div>
    );
  }
  return (
    <div className="px-3 py-3">
      <p className="mb-3 text-[11px] leading-relaxed text-stone-400">
        The product’s memory. Reverting restores tokens and frames to the moment
        before that change.
      </p>
      <ol className="space-y-2">
        {state.changelog.map((e) => (
          <li key={e.id} className="rounded-lg border border-stone-200 bg-white px-2.5 py-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[13px] text-stone-800">
                  <span className="mr-1.5 font-mono text-[11px] text-stone-400">#{e.seq}</span>
                  {e.summary}
                </div>
                {e.detail && <div className="mt-0.5 font-mono text-[11px] text-stone-400">{e.detail}</div>}
              </div>
              <button
                onClick={() => dispatch({ type: 'revert-to', entryId: e.id })}
                className="flex shrink-0 items-center gap-1 rounded-md border border-stone-200 px-1.5 py-1 text-[10px] text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-800"
                title="Revert to before this change"
              >
                <RotateCcw size={10} />
                Revert
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AuditTab() {
  const { state, dispatch } = useStudio();
  const findings = useMemo(() => runAudit(state.tokens, state.screens), [state.tokens, state.screens]);
  const issues = findings.filter((f) => f.severity === 'issue');
  const warnings = findings.filter((f) => f.severity === 'warning');
  return (
    <div className="px-3 py-3">
      <p className="mb-3 text-[11px] leading-relaxed text-stone-400">
        A live health check: token drift, WCAG contrast, and structural gaps — the
        same report Felix gives when you say “audit the product”.
      </p>
      <div className="mb-3 flex gap-2">
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-800">
          {issues.length} issue{issues.length === 1 ? '' : 's'}
        </span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
          {warnings.length} warning{warnings.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="space-y-2">
        {findings.map((f, i) => (
          <div
            key={i}
            className={
              f.severity === 'issue'
                ? 'rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-2'
                : f.severity === 'warning'
                  ? 'rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-2'
                  : 'rounded-lg border border-green-200 bg-green-50/60 px-2.5 py-2'
            }
          >
            <div className="text-[13px] font-medium text-stone-800">{f.title}</div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-stone-600">{f.detail}</div>
          </div>
        ))}
      </div>
      {issues.some((f) => f.title.includes('drift')) && (
        <button
          onClick={() => dispatch({ type: 'converse', input: 'fix drift' })}
          className="mt-3 w-full rounded-lg bg-stone-800 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-stone-700"
        >
          Fix all drift
        </button>
      )}
    </div>
  );
}

export function RightPanel() {
  const { state } = useStudio();
  const [tab, setTab] = useState<Tab>('design');
  const sel = state.selection;

  const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'changelog', label: 'Changelog', icon: History },
    { id: 'audit', label: 'Audit', icon: ShieldCheck },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-l border-stone-200 bg-white">
      <div className="flex border-b border-stone-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={
              tab === id
                ? 'flex flex-1 items-center justify-center gap-1 border-b-2 border-stone-800 py-2 text-xs font-semibold text-stone-900'
                : 'flex flex-1 items-center justify-center gap-1 border-b-2 border-transparent py-2 text-xs text-stone-500 transition-colors hover:text-stone-800'
            }
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'design' &&
          (sel.kind === 'block' ? (
            <BlockPane key={sel.blockId} screenId={sel.screenId} blockId={sel.blockId} />
          ) : sel.kind === 'screen' ? (
            <ScreenPane key={sel.screenId} screenId={sel.screenId} />
          ) : (
            <TokensPane />
          ))}
        {tab === 'changelog' && <ChangelogTab />}
        {tab === 'audit' && <AuditTab />}
      </div>
    </aside>
  );
}

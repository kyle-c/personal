import { useMemo, useState } from 'react';
import {
  Blocks,
  History,
  Palette,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { tokensToCssVars, TokenSet } from '../felix/tokens';
import { runAudit } from '../engine/audit';
import { useStudio } from '../engine/store';
import {
  FBadge,
  FButton,
  FCard,
  FHeading,
  FInput,
  FStat,
  FText,
} from '../felix/primitives';

type Tab = 'tokens' | 'components' | 'changelog' | 'audit';

const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
  { id: 'tokens', label: 'Tokens', icon: Palette },
  { id: 'components', label: 'Primitives', icon: Blocks },
  { id: 'changelog', label: 'Changelog', icon: History },
  { id: 'audit', label: 'Audit', icon: ShieldCheck },
];

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
      <span className="text-sm text-stone-700">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs text-stone-400">{value.toUpperCase()}</span>
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

function TokensTab() {
  const { state, dispatch } = useStudio();
  const t = state.tokens;

  const update = (summary: string, mutate: (draft: TokenSet) => void) => {
    const draft: TokenSet = JSON.parse(JSON.stringify(t));
    mutate(draft);
    dispatch({ type: 'set-tokens-direct', tokens: draft, summary });
  };

  return (
    <div className="px-4 py-3">
      <p className="mb-1 text-xs leading-relaxed text-stone-500">
        The single source of truth. Edit here or just ask Felix — either way the whole
        product updates and the change lands in the changelog.
      </p>

      <SectionLabel>Color</SectionLabel>
      <ColorRow label="Primary" value={t.color.primary} onChange={(v) => update('Changed primary color', (d) => { d.color.primary = v; })} />
      <ColorRow label="Ink" value={t.color.ink} onChange={(v) => update('Changed ink color', (d) => { d.color.ink = v; })} />
      <ColorRow label="Background" value={t.color.background} onChange={(v) => update('Changed background color', (d) => { d.color.background = v; })} />
      <ColorRow label="Surface" value={t.color.surface} onChange={(v) => update('Changed surface color', (d) => { d.color.surface = v; })} />

      <SectionLabel>Shape</SectionLabel>
      <div className="flex items-center justify-between gap-3 py-1">
        <span className="text-sm text-stone-700">Corner radius</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={24}
            step={2}
            value={t.radius.base}
            onChange={(e) => update('Adjusted corner radius', (d) => { d.radius.base = Number(e.target.value); })}
            className="w-28 accent-stone-700"
          />
          <span className="w-10 text-right font-mono text-xs text-stone-400">{t.radius.base}px</span>
        </div>
      </div>

      <SectionLabel>Rhythm</SectionLabel>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-stone-700">Density</span>
        <div className="flex gap-1">
          {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
            <button
              key={d}
              onClick={() => update(`Set spacing density to ${d}`, (dr) => { dr.space.density = d; })}
              className={
                t.space.density === d
                  ? 'rounded-md bg-stone-800 px-2 py-1 text-[11px] font-medium text-white'
                  : 'rounded-md border border-stone-200 px-2 py-1 text-[11px] text-stone-500 hover:border-stone-400'
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <SectionLabel>Depth</SectionLabel>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-stone-700">Shadows</span>
        <div className="flex gap-1">
          {(['none', 'soft', 'pronounced'] as const).map((s) => (
            <button
              key={s}
              onClick={() => update(`Set shadows to ${s}`, (d) => { d.shadow.level = s; })}
              className={
                t.shadow.level === s
                  ? 'rounded-md bg-stone-800 px-2 py-1 text-[11px] font-medium text-white'
                  : 'rounded-md border border-stone-200 px-2 py-1 text-[11px] text-stone-500 hover:border-stone-400'
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
          <span className="text-sm text-stone-700">Display</span>
          <span className="max-w-[55%] truncate text-right font-mono text-xs text-stone-400">
            {t.typography.displayFamily.split(',')[0].replace(/"/g, '')}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-700">Body</span>
          <span className="max-w-[55%] truncate text-right font-mono text-xs text-stone-400">
            {t.typography.bodyFamily.split(',')[0].replace(/"/g, '')}
          </span>
        </div>
        <p className="pt-1 text-[11px] text-stone-400">
          Change with e.g. “use a serif for headings” or “switch body font to sans”.
        </p>
      </div>
    </div>
  );
}

function ComponentsTab() {
  const { state } = useStudio();
  const vars = useMemo(() => tokensToCssVars(state.tokens), [state.tokens]);
  return (
    <div className="px-4 py-3">
      <p className="mb-3 text-xs leading-relaxed text-stone-500">
        Felix primitives, rendered live from the current tokens. Everything on the
        canvas is composed from these — nothing else.
      </p>
      <div
        className="space-y-4 rounded-lg border border-stone-200 p-4"
        style={{ ...vars, background: 'var(--felix-color-background)' } as React.CSSProperties}
      >
        <div className="flex flex-wrap items-center gap-2">
          <FButton>Primary</FButton>
          <FButton variant="secondary">Secondary</FButton>
          <FButton variant="ghost">Ghost</FButton>
          <FButton variant="danger">Danger</FButton>
        </div>
        <div className="flex flex-wrap gap-2">
          <FBadge>Primary</FBadge>
          <FBadge tone="positive">Positive</FBadge>
          <FBadge tone="warning">Warning</FBadge>
          <FBadge tone="danger">Danger</FBadge>
          <FBadge tone="neutral">Neutral</FBadge>
        </div>
        <FInput label="Input" placeholder="Placeholder text" />
        <FCard>
          <FHeading level={3}>Card</FHeading>
          <div style={{ marginTop: 'var(--felix-space-2)' }}>
            <FText muted small>Surface, border, radius and shadow all come from tokens.</FText>
          </div>
        </FCard>
        <FCard>
          <FStat label="Stat" value="42.7k" delta="+18%" />
        </FCard>
      </div>
    </div>
  );
}

function ChangelogTab() {
  const { state, dispatch } = useStudio();
  if (state.changelog.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-stone-400">
        No changes yet. Everything you and Felix do together will be recorded here,
        each with a one-click revert.
      </div>
    );
  }
  return (
    <div className="px-4 py-3">
      <p className="mb-3 text-xs leading-relaxed text-stone-500">
        The product’s memory. Reverting restores tokens and screens to the moment
        before that change.
      </p>
      <ol className="space-y-2">
        {state.changelog.map((e) => (
          <li key={e.id} className="rounded-lg border border-stone-200 bg-white px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm text-stone-800">
                  <span className="mr-1.5 font-mono text-xs text-stone-400">#{e.seq}</span>
                  {e.summary}
                </div>
                {e.detail && <div className="mt-0.5 font-mono text-xs text-stone-400">{e.detail}</div>}
              </div>
              <button
                onClick={() => dispatch({ type: 'revert-to', entryId: e.id })}
                className="flex shrink-0 items-center gap-1 rounded-md border border-stone-200 px-2 py-1 text-[11px] text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-800"
                title="Revert to before this change"
              >
                <RotateCcw size={11} />
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
    <div className="px-4 py-3">
      <p className="mb-3 text-xs leading-relaxed text-stone-500">
        A live health check: token drift, WCAG contrast, and structural gaps. This runs
        continuously — the same report Felix gives when you say “audit the product”.
      </p>
      <div className="mb-3 flex gap-2">
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
          {issues.length} issue{issues.length === 1 ? '' : 's'}
        </span>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
          {warnings.length} warning{warnings.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="space-y-2">
        {findings.map((f, i) => (
          <div
            key={i}
            className={
              f.severity === 'issue'
                ? 'rounded-lg border border-red-200 bg-red-50/60 px-3 py-2'
                : f.severity === 'warning'
                  ? 'rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2'
                  : 'rounded-lg border border-green-200 bg-green-50/60 px-3 py-2'
            }
          >
            <div className="text-sm font-medium text-stone-800">{f.title}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-stone-600">{f.detail}</div>
          </div>
        ))}
      </div>
      {issues.some((f) => f.title.includes('drift')) && (
        <button
          onClick={() => dispatch({ type: 'converse', input: 'fix drift' })}
          className="mt-3 w-full rounded-lg bg-stone-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Fix all drift
        </button>
      )}
    </div>
  );
}

export function Inspector() {
  const [tab, setTab] = useState<Tab>('tokens');
  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-stone-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={
              tab === id
                ? 'flex flex-1 items-center justify-center gap-1.5 border-b-2 border-stone-800 px-2 py-2.5 text-xs font-semibold text-stone-900'
                : 'flex flex-1 items-center justify-center gap-1.5 border-b-2 border-transparent px-2 py-2.5 text-xs text-stone-500 transition-colors hover:text-stone-800'
            }
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'tokens' && <TokensTab />}
        {tab === 'components' && <ComponentsTab />}
        {tab === 'changelog' && <ChangelogTab />}
        {tab === 'audit' && <AuditTab />}
      </div>
    </div>
  );
}

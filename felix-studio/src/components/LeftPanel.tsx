import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CreditCard,
  Frame as FrameIcon,
  Globe,
  LayoutGrid,
  LayoutPanelTop,
  ListOrdered,
  Megaphone,
  MessageCircle,
  MessageSquareQuote,
  Navigation,
  PanelBottom,
  Smartphone,
  Table2,
  TextCursorInput,
} from 'lucide-react';
import { BLOCK_LABELS, SURFACE_LABELS, useStudio } from '../engine/store';
import { BlockKind, Screen, SurfaceType } from '../engine/types';
import { tokensToCssVars } from '../felix/tokens';
import {
  FBadge,
  FButton,
  FCard,
  FHeading,
  FInput,
  FStat,
  FText,
} from '../felix/primitives';

const BLOCK_ICONS: Record<BlockKind, typeof FrameIcon> = {
  navbar: Navigation,
  hero: LayoutPanelTop,
  features: LayoutGrid,
  stats: ListOrdered,
  form: TextCursorInput,
  pricing: CreditCard,
  testimonial: MessageSquareQuote,
  table: Table2,
  cta: Megaphone,
  footer: PanelBottom,
};

const SURFACE_ICONS: Record<SurfaceType, typeof Globe> = {
  web: Globe,
  native: Smartphone,
  chat: MessageCircle,
};

function ScreenRows({ screen }: { screen: Screen }) {
  const { state, dispatch } = useStudio();
  const sel = state.selection;
  const screenSelected = sel.kind === 'screen' && sel.screenId === screen.id;
  return (
    <div className="mb-0.5">
      <button
        onClick={() => dispatch({ type: 'select', selection: { kind: 'screen', screenId: screen.id } })}
        className={
          'flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[13px] font-medium ' +
          (screenSelected ? 'bg-blue-50 text-blue-700' : 'text-stone-700 hover:bg-stone-100')
        }
      >
        <FrameIcon size={13} className={screenSelected ? 'text-blue-500' : 'text-stone-400'} />
        {screen.name}
      </button>
      {screen.surface === 'chat'
        ? screen.steps.map((step) => {
            const stepSelected = sel.kind === 'step' && sel.stepId === step.id;
            return (
              <button
                key={step.id}
                onClick={() =>
                  dispatch({ type: 'select', selection: { kind: 'step', screenId: screen.id, stepId: step.id } })
                }
                className={
                  'flex w-full items-center gap-1.5 py-1 pl-8 pr-3 text-left text-xs ' +
                  (stepSelected ? 'bg-blue-50 text-blue-700' : 'text-stone-500 hover:bg-stone-100')
                }
              >
                <MessageCircle size={12} className={stepSelected ? 'text-blue-500' : 'text-stone-400'} />
                {step.name}
              </button>
            );
          })
        : screen.blocks.map((block) => {
            const Icon = BLOCK_ICONS[block.kind];
            const blockSelected = sel.kind === 'block' && sel.blockId === block.id;
            return (
              <button
                key={block.id}
                onClick={() =>
                  dispatch({ type: 'select', selection: { kind: 'block', screenId: screen.id, blockId: block.id } })
                }
                className={
                  'flex w-full items-center gap-1.5 py-1 pl-8 pr-3 text-left text-xs ' +
                  (blockSelected ? 'bg-blue-50 text-blue-700' : 'text-stone-500 hover:bg-stone-100')
                }
              >
                <Icon size={12} className={blockSelected ? 'text-blue-500' : 'text-stone-400'} />
                <span className="capitalize">{BLOCK_LABELS[block.kind]}</span>
                {block.overrides && (
                  <AlertTriangle size={11} className="ml-auto text-amber-500" aria-label="Token drift" />
                )}
              </button>
            );
          })}
    </div>
  );
}

function LayersTab() {
  const { state } = useStudio();
  const surfaces: SurfaceType[] = ['web', 'native', 'chat'];
  return (
    <div className="py-2">
      {surfaces.map((surface) => {
        const screens = state.screens.filter((s) => s.surface === surface);
        if (screens.length === 0) return null;
        const Icon = SURFACE_ICONS[surface];
        return (
          <div key={surface} className="mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              <Icon size={11} />
              {SURFACE_LABELS[surface]}
            </div>
            {screens.map((screen) => (
              <ScreenRows key={screen.id} screen={screen} />
            ))}
          </div>
        );
      })}
      <p className="px-3 pt-1 text-[11px] leading-relaxed text-stone-400">
        Ask Felix for new frames — “create a settings page with a form”, “create an app
        screen for booking”, “create a whatsapp flow for orders”.
      </p>
    </div>
  );
}

function AssetsTab() {
  const { state } = useStudio();
  const vars = useMemo(() => tokensToCssVars(state.tokens), [state.tokens]);
  return (
    <div className="px-3 py-3">
      <p className="mb-3 text-[11px] leading-relaxed text-stone-400">
        Felix primitives, rendered live from the current tokens. Everything on the
        canvas is composed from these — nothing else.
      </p>
      <div
        className="space-y-3 rounded-lg border border-stone-200 p-3"
        style={{ ...vars, background: 'var(--felix-color-background)' } as React.CSSProperties}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <FButton small>Primary</FButton>
          <FButton small variant="secondary">Secondary</FButton>
          <FButton small variant="ghost">Ghost</FButton>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FBadge>Primary</FBadge>
          <FBadge tone="positive">Positive</FBadge>
          <FBadge tone="warning">Warning</FBadge>
        </div>
        <FInput label="Input" placeholder="Placeholder" />
        <FCard style={{ padding: 'var(--felix-space-4)' }}>
          <FHeading level={3}>Card</FHeading>
          <div style={{ marginTop: 'var(--felix-space-1)' }}>
            <FText muted small>Surface, radius and shadow from tokens.</FText>
          </div>
        </FCard>
        <FCard style={{ padding: 'var(--felix-space-4)' }}>
          <FStat label="Stat" value="42.7k" delta="+18%" />
        </FCard>
      </div>
    </div>
  );
}

export function LeftPanel() {
  const [tab, setTab] = useState<'layers' | 'assets'>('layers');
  const tabBtn = (active: boolean) =>
    active
      ? 'flex-1 border-b-2 border-stone-800 py-2 text-xs font-semibold text-stone-900'
      : 'flex-1 border-b-2 border-transparent py-2 text-xs text-stone-500 transition-colors hover:text-stone-800';
  return (
    <aside className="flex h-full w-60 flex-col border-r border-stone-200 bg-white">
      <div className="flex border-b border-stone-200">
        <button className={tabBtn(tab === 'layers')} onClick={() => setTab('layers')}>Layers</button>
        <button className={tabBtn(tab === 'assets')} onClick={() => setTab('assets')}>Assets</button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'layers' ? <LayersTab /> : <AssetsTab />}
      </div>
    </aside>
  );
}

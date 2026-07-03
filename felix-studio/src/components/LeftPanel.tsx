import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CreditCard,
  Frame as FrameIcon,
  LayoutGrid,
  LayoutPanelTop,
  ListOrdered,
  Megaphone,
  MessageSquareQuote,
  Navigation,
  PanelBottom,
  Table2,
  TextCursorInput,
} from 'lucide-react';
import { BLOCK_LABELS, useStudio } from '../engine/store';
import { BlockKind } from '../engine/types';
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

function LayersTab() {
  const { state, dispatch } = useStudio();
  const sel = state.selection;
  return (
    <div className="py-2">
      {state.screens.map((screen) => {
        const screenSelected = sel.kind === 'screen' && sel.screenId === screen.id;
        return (
          <div key={screen.id} className="mb-1">
            <button
              onClick={() =>
                dispatch({ type: 'select', selection: { kind: 'screen', screenId: screen.id } })
              }
              className={
                'flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[13px] font-medium ' +
                (screenSelected ? 'bg-blue-50 text-blue-700' : 'text-stone-700 hover:bg-stone-100')
              }
            >
              <FrameIcon size={13} className={screenSelected ? 'text-blue-500' : 'text-stone-400'} />
              {screen.name}
            </button>
            <div>
              {screen.blocks.map((block) => {
                const Icon = BLOCK_ICONS[block.kind];
                const blockSelected = sel.kind === 'block' && sel.blockId === block.id;
                return (
                  <button
                    key={block.id}
                    onClick={() =>
                      dispatch({
                        type: 'select',
                        selection: { kind: 'block', screenId: screen.id, blockId: block.id },
                      })
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
          </div>
        );
      })}
      <p className="px-3 pt-2 text-[11px] leading-relaxed text-stone-400">
        Ask Felix for new frames and sections — “create a settings page with a form”.
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

import { useMemo } from 'react';
import { Monitor } from 'lucide-react';
import { tokensToCssVars } from '../felix/tokens';
import { useStudio } from '../engine/store';
import { BlockRenderer } from './blocks';

/**
 * The live product. Everything inside the frame is rendered from Felix
 * primitives reading token CSS variables — the conversation restyles it in
 * real time.
 */
export function Canvas() {
  const { state, dispatch } = useStudio();
  const vars = useMemo(() => tokensToCssVars(state.tokens), [state.tokens]);
  const active =
    state.screens.find((s) => s.id === state.activeScreenId) ?? state.screens[0];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Monitor size={15} className="text-stone-500" />
          <span className="text-sm font-semibold text-stone-800">Fieldnote</span>
          <span className="text-xs text-stone-400">— the product you’re building</span>
        </div>
        <div className="flex gap-1">
          {state.screens.map((s) => (
            <button
              key={s.id}
              onClick={() => dispatch({ type: 'select-screen', screenId: s.id })}
              className={
                s.id === active?.id
                  ? 'rounded-md bg-stone-800 px-2.5 py-1 text-xs font-medium text-stone-50'
                  : 'rounded-md px-2.5 py-1 text-xs text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-800'
              }
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-stone-200/60 p-5">
        <div
          className="mx-auto min-h-full max-w-4xl overflow-hidden rounded-xl border border-stone-300 shadow-sm"
          style={{ ...vars, background: 'var(--felix-color-background)' } as React.CSSProperties}
        >
          {active && active.blocks.length > 0 ? (
            active.blocks.map((block) => <BlockRenderer key={block.id} block={block} />)
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-stone-400">
              This screen is empty — ask Felix to add a section.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

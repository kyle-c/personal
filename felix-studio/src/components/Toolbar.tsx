import {
  Hand,
  Maximize2,
  Minus,
  MousePointer2,
  Plus,
  RefreshCw,
  RotateCcw,
  Share,
} from 'lucide-react';
import { CanvasApi, Tool, Viewport } from './Canvas';
import { useCollab, useStudio } from '../engine/store';

/** Who's here: your avatar plus every connected peer, Figma-style. */
function PresenceStack() {
  const { status, peers, identity, room } = useCollab();
  return (
    <div className="flex items-center gap-2" title={status === 'live' ? `Live — room “${room}”` : status === 'solo' ? 'Solo — run `npm run server` for multiplayer' : 'Connecting to sync server…'}>
      <div className="flex -space-x-1.5">
        <span
          data-testid="avatar-you"
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
          style={{ background: identity.color }}
        >
          {identity.name[0]}
        </span>
        {peers.map((p) => (
          <span
            key={p.id}
            data-testid="avatar-peer"
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
            style={{ background: p.color }}
            title={p.name}
          >
            {p.name[0]}
          </span>
        ))}
      </div>
      <span className="flex items-center gap-1 text-[11px] text-stone-500">
        <span
          className={
            'inline-block h-1.5 w-1.5 rounded-full ' +
            (status === 'live' ? 'bg-green-500' : status === 'solo' ? 'bg-stone-300' : 'animate-pulse bg-amber-400')
          }
        />
        {status === 'live' ? `${peers.length + 1} here` : status === 'solo' ? 'solo' : '…'}
      </span>
    </div>
  );
}

export function Toolbar({
  tool,
  setTool,
  viewport,
  api,
  onExport,
}: {
  tool: Tool;
  setTool: (t: Tool) => void;
  viewport: Viewport;
  api: () => CanvasApi | null;
  onExport: () => void;
}) {
  const { dispatch } = useStudio();
  const toolBtn = (active: boolean) =>
    active
      ? 'flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white'
      : 'flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800';
  const iconBtn =
    'flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800';

  return (
    <header className="z-10 flex items-center justify-between border-b border-stone-200 bg-white px-3 py-1.5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="font-display text-base font-semibold text-stone-800">Felix Studio</span>
        <div className="h-5 w-px bg-stone-200" />
        <div className="flex items-center gap-0.5">
          <button className={toolBtn(tool === 'select')} onClick={() => setTool('select')} title="Select (V)">
            <MousePointer2 size={15} />
          </button>
          <button className={toolBtn(tool === 'hand')} onClick={() => setTool('hand')} title="Hand — pan the canvas (H, or hold Space)">
            <Hand size={15} />
          </button>
        </div>
        <div className="h-5 w-px bg-stone-200" />
        <button className={iconBtn} onClick={() => dispatch({ type: 'undo' })} title="Undo (⌘Z)">
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="hidden text-xs text-stone-400 lg:block">
        one product, three surfaces — talk to Felix to build and maintain it
      </div>

      <div className="flex items-center gap-0.5">
        <PresenceStack />
        <div className="mx-1.5 h-5 w-px bg-stone-200" />
        <button className={iconBtn} onClick={() => api()?.zoomOut()} title="Zoom out">
          <Minus size={15} />
        </button>
        <span className="w-12 text-center font-mono text-xs text-stone-600">
          {Math.round(viewport.scale * 100)}%
        </span>
        <button className={iconBtn} onClick={() => api()?.zoomIn()} title="Zoom in">
          <Plus size={15} />
        </button>
        <button className={iconBtn} onClick={() => api()?.zoomToFit()} title="Zoom to fit (Shift+1)">
          <Maximize2 size={15} />
        </button>
        <div className="mx-1.5 h-5 w-px bg-stone-200" />
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-md bg-stone-800 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-700"
        >
          <Share size={12} />
          Export
        </button>
        <button
          onClick={() => {
            if (window.confirm('Reset the studio to its starting state? This clears all changes.')) {
              dispatch({ type: 'reset' });
            }
          }}
          className="flex items-center gap-1.5 rounded-md border border-stone-200 px-2.5 py-1.5 text-xs text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-800"
        >
          <RefreshCw size={12} />
          Reset demo
        </button>
      </div>
    </header>
  );
}

import {
  Hand,
  Maximize2,
  Minus,
  MousePointer2,
  Plus,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { CanvasApi, Tool, Viewport } from './Canvas';
import { useStudio } from '../engine/store';

export function Toolbar({
  tool,
  setTool,
  viewport,
  api,
}: {
  tool: Tool;
  setTool: (t: Tool) => void;
  viewport: Viewport;
  api: () => CanvasApi | null;
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

      <div className="hidden text-xs text-stone-400 md:block">
        a conversational design system — talk to Felix to build and maintain the product
      </div>

      <div className="flex items-center gap-0.5">
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

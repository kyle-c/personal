import { useEffect, useRef, useState } from 'react';
import { Canvas, CanvasApi, Tool, Viewport } from './components/Canvas';
import { ChatDock } from './components/ChatDock';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { Toolbar } from './components/Toolbar';
import { StudioProvider, useStudio } from './engine/store';

function Shell() {
  const { state, dispatch } = useStudio();
  const [tool, setTool] = useState<Tool>('select');
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 0.5 });
  const canvasApi = useRef<CanvasApi | null>(null);

  // Global keyboard shortcuts (skipped while typing in a field).
  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        dispatch({ type: 'undo' });
        return;
      }
      if (e.key === 'v' || e.key === 'V') setTool('select');
      if (e.key === 'h' || e.key === 'H') setTool('hand');
      if (e.key === 'Escape') dispatch({ type: 'select', selection: { kind: 'none' } });
      if (e.shiftKey && e.key === '!') canvasApi.current?.zoomToFit();
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const sel = state.selection;
        if (sel.kind === 'block') {
          dispatch({ type: 'delete-block', screenId: sel.screenId, blockId: sel.blockId });
        } else if (sel.kind === 'screen') {
          const screen = state.screens.find((s) => s.id === sel.screenId);
          if (screen && state.screens.length > 1) {
            dispatch({ type: 'converse', input: `delete the ${screen.name.toLowerCase()} page` });
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, state.selection, state.screens]);

  return (
    <div className="flex h-screen flex-col bg-white text-stone-800">
      <Toolbar tool={tool} setTool={setTool} viewport={viewport} api={() => canvasApi.current} />
      <div className="flex min-h-0 flex-1">
        <LeftPanel />
        <main className="relative min-w-0 flex-1">
          <Canvas tool={tool} viewport={viewport} setViewport={setViewport} apiRef={canvasApi} />
          <ChatDock />
        </main>
        <RightPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StudioProvider>
      <Shell />
    </StudioProvider>
  );
}

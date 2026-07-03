import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { tokensToCssVars } from '../felix/tokens';
import { BLOCK_LABELS, FRAME_WIDTH, useStudio } from '../engine/store';
import { Screen } from '../engine/types';
import { BlockRenderer } from './blocks';

export type Tool = 'select' | 'hand';

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasApi {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
}

const MIN_SCALE = 0.08;
const MAX_SCALE = 3;

function clampScale(s: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
}

function Frame({
  screen,
  selected,
  selectedBlockId,
  tool,
  scale,
  onMove,
}: {
  screen: Screen;
  selected: boolean;
  selectedBlockId: string | null;
  tool: Tool;
  scale: number;
  onMove: (x: number, y: number) => void;
}) {
  const { dispatch } = useStudio();
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const onLabelPointerDown = (e: React.PointerEvent) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    dispatch({ type: 'select', selection: { kind: 'screen', screenId: screen.id } });
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: screen.x, origY: screen.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onLabelPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    onMove(d.origX + (e.clientX - d.startX) / scale, d.origY + (e.clientY - d.startY) / scale);
  };
  const onLabelPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div style={{ position: 'absolute', left: screen.x, top: screen.y, width: FRAME_WIDTH }}>
      <div
        onPointerDown={onLabelPointerDown}
        onPointerMove={onLabelPointerMove}
        onPointerUp={onLabelPointerUp}
        className={
          'mb-1.5 inline-flex cursor-grab select-none items-center gap-1 text-xs font-medium active:cursor-grabbing ' +
          (selected ? 'text-blue-600' : 'text-stone-500 hover:text-stone-700')
        }
        style={{
          // Keep the label legible at any zoom level, like Figma does.
          transform: `scale(${Math.min(2.4, 1 / scale)})`,
          transformOrigin: 'left bottom',
        }}
        title="Drag to move the frame"
      >
        {screen.name}
      </div>

      <div
        onClick={(e) => {
          if (tool !== 'select') return;
          e.stopPropagation();
          dispatch({ type: 'select', selection: { kind: 'screen', screenId: screen.id } });
        }}
        className="overflow-hidden bg-white"
        style={{
          borderRadius: 6,
          boxShadow: selected
            ? `0 0 0 ${2 / scale}px #3B82F6, 0 8px 24px rgba(28,25,23,0.12)`
            : '0 0 0 1px rgba(28,25,23,0.08), 0 8px 24px rgba(28,25,23,0.10)',
          background: 'var(--felix-color-background)',
        }}
      >
        {screen.blocks.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-stone-400">
            Empty frame — ask Felix to add a section.
          </div>
        ) : (
          screen.blocks.map((block) => {
            const isSel = block.id === selectedBlockId;
            return (
              <div
                key={block.id}
                onClick={(e) => {
                  if (tool !== 'select') return;
                  e.stopPropagation();
                  dispatch({
                    type: 'select',
                    selection: { kind: 'block', screenId: screen.id, blockId: block.id },
                  });
                }}
                className="group relative"
              >
                <div style={{ pointerEvents: 'none' }}>
                  <BlockRenderer block={block} />
                </div>
                <div
                  className={
                    'pointer-events-none absolute inset-0 transition-[box-shadow] ' +
                    (isSel ? '' : 'group-hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.55)]')
                  }
                  style={isSel ? { boxShadow: `inset 0 0 0 ${2 / scale}px #3B82F6` } : undefined}
                />
                {isSel && (
                  <div
                    className="pointer-events-none absolute left-0 top-0 bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    style={{ transform: `scale(${Math.min(2.4, 1 / scale)})`, transformOrigin: 'left top' }}
                  >
                    {BLOCK_LABELS[block.kind]}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function Canvas({
  tool,
  viewport,
  setViewport,
  apiRef,
}: {
  tool: Tool;
  viewport: Viewport;
  setViewport: (v: Viewport | ((prev: Viewport) => Viewport)) => void;
  apiRef: MutableRefObject<CanvasApi | null>;
}) {
  const { state, dispatch } = useStudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const vars = useMemo(() => tokensToCssVars(state.tokens), [state.tokens]);
  const panning = tool === 'hand' || spaceHeld;

  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setViewport((prev) => {
        const scale = clampScale(prev.scale * factor);
        if (scale === prev.scale) return prev;
        const px = clientX - rect.left;
        const py = clientY - rect.top;
        return {
          scale,
          x: px - ((px - prev.x) / prev.scale) * scale,
          y: py - ((py - prev.y) / prev.scale) * scale,
        };
      });
    },
    [setViewport],
  );

  const zoomToFit = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || state.screens.length === 0) return;
    const PAD = 80;
    const minX = Math.min(...state.screens.map((s) => s.x)) - PAD;
    const maxX = Math.max(...state.screens.map((s) => s.x + FRAME_WIDTH)) + PAD;
    const minY = Math.min(...state.screens.map((s) => s.y)) - PAD;
    // Frame heights are content-driven; assume a tall page for fitting width-first.
    const scale = clampScale(Math.min(rect.width / (maxX - minX), 1));
    setViewport({ scale, x: -minX * scale + (rect.width - (maxX - minX) * scale) / 2, y: -minY * scale + 24 });
  }, [state.screens, setViewport]);

  useEffect(() => {
    apiRef.current = {
      zoomIn: () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.25);
      },
      zoomOut: () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 0.8);
      },
      zoomToFit,
    };
  }, [apiRef, zoomAt, zoomToFit]);

  // Fit once on first mount.
  const didFit = useRef(false);
  useEffect(() => {
    if (!didFit.current) {
      didFit.current = true;
      zoomToFit();
    }
  }, [zoomToFit]);

  // Wheel: pan by default, zoom with ⌘/Ctrl — Figma behavior. Native listener
  // because React's onWheel is passive and can't preventDefault.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else {
        setViewport((prev) => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt, setViewport]);

  // Space bar = temporary hand tool (ignored while typing).
  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping(e.target)) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    // Middle mouse always pans; left pans when hand tool / space is active.
    if (e.button === 1 || (e.button === 0 && panning)) {
      panRef.current = { startX: e.clientX, startY: e.clientY, origX: viewport.x, origY: viewport.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = panRef.current;
    if (!p) return;
    setViewport((prev) => ({
      ...prev,
      x: p.origX + (e.clientX - p.startX),
      y: p.origY + (e.clientY - p.startY),
    }));
  };
  const onPointerUp = () => {
    panRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      data-testid="canvas"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => {
        if (!panning) dispatch({ type: 'select', selection: { kind: 'none' } });
      }}
      className="relative h-full w-full overflow-hidden bg-[#E8E6DF]"
      style={{
        cursor: panning ? (panRef.current ? 'grabbing' : 'grab') : 'default',
        backgroundImage: 'radial-gradient(rgba(28,25,23,0.10) 1px, transparent 1px)',
        backgroundSize: `${24 * viewport.scale}px ${24 * viewport.scale}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
          ...vars,
        } as React.CSSProperties}
      >
        {state.screens.map((s) => (
          <Frame
            key={s.id}
            screen={s}
            tool={panning ? 'hand' : tool}
            scale={viewport.scale}
            selected={state.selection.kind !== 'none' && state.selection.screenId === s.id && state.selection.kind === 'screen'}
            selectedBlockId={
              state.selection.kind === 'block' && state.selection.screenId === s.id
                ? state.selection.blockId
                : null
            }
            onMove={(x, y) => dispatch({ type: 'move-screen', screenId: s.id, x, y })}
          />
        ))}
      </div>
    </div>
  );
}

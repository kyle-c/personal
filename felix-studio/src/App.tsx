import { RefreshCw } from 'lucide-react';
import { Canvas } from './components/Canvas';
import { Conversation } from './components/Conversation';
import { Inspector } from './components/Inspector';
import { StudioProvider, useStudio } from './engine/store';

function Shell() {
  const { dispatch } = useStudio();
  return (
    <div className="flex h-screen flex-col bg-[#FAF9F5] text-stone-800">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white/70 px-4 py-2.5 backdrop-blur">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold">Felix Studio</span>
          <span className="hidden text-xs text-stone-500 sm:inline">
            a conversational design system — build and maintain the product by talking to it
          </span>
        </div>
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
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(300px,360px)_1fr_minmax(300px,340px)]">
        <section className="min-h-0 border-r border-stone-200 bg-[#F5F3EC]">
          <Conversation />
        </section>
        <section className="min-h-0">
          <Canvas />
        </section>
        <section className="min-h-0 border-l border-stone-200 bg-[#F5F3EC]">
          <Inspector />
        </section>
      </main>
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

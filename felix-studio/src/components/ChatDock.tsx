import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Send,
  Sparkles,
} from 'lucide-react';
import { useStudio } from '../engine/store';
import { AuditFinding } from '../engine/types';

const SUGGESTIONS = [
  'This is a dental clinic called Brightside',
  'Create a whatsapp flow for orders',
  'Create an app screen for booking',
  'Change the primary color to forest green',
  'Make the tone playful',
  'Audit the product',
];

function FindingRow({ finding }: { finding: AuditFinding }) {
  const icon =
    finding.severity === 'issue' ? (
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-700" />
    ) : finding.severity === 'warning' ? (
      <Info size={14} className="mt-0.5 shrink-0 text-amber-700" />
    ) : (
      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-700" />
    );
  return (
    <div className="flex gap-2 rounded-md border border-stone-200 bg-white/70 px-2.5 py-2">
      {icon}
      <div>
        <div className="text-xs font-semibold text-stone-800">{finding.title}</div>
        <div className="text-xs leading-relaxed text-stone-600">{finding.detail}</div>
      </div>
    </div>
  );
}

/** Floating conversational dock over the canvas — Felix’s prompt bar. */
export function ChatDock() {
  const { state, converse } = useStudio();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(state.messages.length);

  useEffect(() => {
    if (state.messages.length !== lastCount.current) {
      lastCount.current = state.messages.length;
      setOpen(true);
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.messages.length, open, state.busy]);

  const send = (text: string) => {
    if (!text.trim()) return;
    converse(text);
    setInput('');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[540px] max-w-[calc(100%-2rem)] -translate-x-1/2">
      {open && (
        <div className="pointer-events-auto mb-2 overflow-hidden rounded-xl border border-stone-200 bg-[#F5F3EC]/95 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-stone-200 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <Sparkles size={13} className="text-stone-500" />
              Talk to Felix — your design system, in conversation
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-stone-400 hover:text-stone-700"
              aria-label="Collapse conversation"
            >
              <ChevronDown size={15} />
            </button>
          </div>
          <div ref={scrollRef} className="max-h-72 space-y-2.5 overflow-y-auto px-3 py-3">
            {state.messages.map((m) => (
              <div key={m.id} className={m.role === 'designer' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'designer'
                      ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-stone-800 px-3 py-2 text-[13px] text-stone-50'
                      : 'max-w-[92%] rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-3 py-2 text-[13px] text-stone-700'
                  }
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                  {m.audit && (
                    <div className="mt-2 space-y-1.5">
                      {m.audit.map((f, i) => (
                        <FindingRow key={i} finding={f} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {state.busy && (
              <div className="flex justify-start" data-testid="felix-thinking">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-3 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-stone-200 px-3 py-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-stone-300 bg-white py-1 pl-3 pr-1 shadow-lg"
      >
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded p-0.5 text-stone-400 hover:text-stone-700"
            aria-label="Expand conversation"
          >
            <ChevronUp size={15} />
          </button>
        )}
        <Sparkles size={14} className="shrink-0 text-stone-400" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what to build or change…"
          className="min-w-0 flex-1 bg-transparent py-1 text-[13px] text-stone-800 placeholder:text-stone-400 focus:outline-none"
        />
        <button
          type="submit"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-800 text-stone-50 transition-colors hover:bg-stone-700"
          aria-label="Send"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}

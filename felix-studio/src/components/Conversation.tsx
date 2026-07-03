import { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Send, Sparkles } from 'lucide-react';
import { useStudio } from '../engine/store';
import { AuditFinding } from '../engine/types';

const SUGGESTIONS = [
  'Create a pricing page with a hero and pricing table',
  'Change the primary color to forest green',
  'Make everything rounder',
  'Audit the product',
  'Make the layout more compact',
];

function FindingRow({ finding }: { finding: AuditFinding }) {
  const icon =
    finding.severity === 'issue' ? (
      <AlertTriangle size={14} className="text-red-700 shrink-0 mt-0.5" />
    ) : finding.severity === 'warning' ? (
      <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
    ) : (
      <CheckCircle2 size={14} className="text-green-700 shrink-0 mt-0.5" />
    );
  return (
    <div className="flex gap-2 rounded-md bg-white/60 border border-stone-200 px-2.5 py-2">
      {icon}
      <div>
        <div className="text-xs font-semibold text-stone-800">{finding.title}</div>
        <div className="text-xs text-stone-600 leading-relaxed">{finding.detail}</div>
      </div>
    </div>
  );
}

export function Conversation() {
  const { state, dispatch } = useStudio();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.messages.length]);

  const send = (text: string) => {
    if (!text.trim()) return;
    dispatch({ type: 'converse', input: text });
    setInput('');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-3">
        <Sparkles size={16} className="text-stone-500" />
        <div>
          <div className="text-sm font-semibold text-stone-800">Talk to Felix</div>
          <div className="text-xs text-stone-500">Your design system, in conversation</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {state.messages.map((m) => (
          <div key={m.id} className={m.role === 'designer' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                m.role === 'designer'
                  ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-stone-800 px-3.5 py-2.5 text-sm text-stone-50'
                  : 'max-w-[92%] rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-700'
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
      </div>

      <div className="border-t border-stone-200 p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what to build or change…"
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-lg bg-stone-800 px-3 text-stone-50 transition-colors hover:bg-stone-700"
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import { exportScreen } from '../engine/exporters';
import { exportHash } from '../engine/hash';
import { SURFACE_LABELS, useStudio } from '../engine/store';

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStudio();
  const [screenId, setScreenId] = useState(state.screens[0]?.id ?? '');
  const [copied, setCopied] = useState(false);
  const screen = state.screens.find((s) => s.id === screenId) ?? state.screens[0];
  const artifact = useMemo(
    () => (screen ? exportScreen(state, screen) : null),
    [state, screen],
  );

  if (!screen || !artifact) return null;

  // Taking the artifact out of the studio is the moment it "ships" — record
  // the fingerprint so the audit can flag it when the product moves on.
  const recordExport = () =>
    dispatch({
      type: 'mark-exported',
      screenId: screen.id,
      hash: exportHash(screen, state.tokens, state.business),
      summary: artifact.filename,
    });

  const download = () => {
    const blob = new Blob([artifact.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename;
    a.click();
    URL.revokeObjectURL(url);
    recordExport();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (permissions) — the user can still select the text.
    }
    recordExport();
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-stone-900/30 p-6"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[640px] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-stone-800">Export — real artifacts per surface</div>
            <div className="text-xs text-stone-500">
              Web ships as standalone HTML, app screens as React Native, chat flows as WhatsApp-style JSON. All styled from the same tokens.
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-stone-400 hover:text-stone-700" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-stone-200 px-4 py-2.5">
          {state.screens.map((s) => (
            <button
              key={s.id}
              onClick={() => setScreenId(s.id)}
              className={
                s.id === screen.id
                  ? 'rounded-md bg-stone-800 px-2.5 py-1 text-xs font-medium text-white'
                  : 'rounded-md border border-stone-200 px-2.5 py-1 text-xs text-stone-500 hover:border-stone-400'
              }
            >
              {s.name}
              <span className="ml-1 opacity-60">· {SURFACE_LABELS[s.surface]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between bg-stone-50 px-4 py-2">
          <span className="font-mono text-xs text-stone-500">{artifact.filename}</span>
          <div className="flex gap-1.5">
            <button
              onClick={copy}
              className="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-stone-600 hover:border-stone-400"
            >
              {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={download}
              className="flex items-center gap-1 rounded-md bg-stone-800 px-2 py-1 text-xs font-medium text-white hover:bg-stone-700"
            >
              <Download size={12} />
              Download
            </button>
          </div>
        </div>

        <textarea
          readOnly
          value={artifact.code}
          className="min-h-0 flex-1 resize-none bg-stone-900 p-4 font-mono text-[11px] leading-relaxed text-stone-100 focus:outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

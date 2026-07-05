/**
 * Renders a chat flow as a WhatsApp-style transcript: each step is a bot
 * bubble with its quick replies beneath it. Brand color and radius come from
 * the tokens; the voice tokens decide emoji. Steps are selectable like blocks.
 */
import { CornerDownRight } from 'lucide-react';
import { emojiFor } from '../engine/copywriter';
import { useStudio } from '../engine/store';
import { ChatStep, Screen } from '../engine/types';

export function ChatTranscript({
  screen,
  selectedStepId,
  interactive,
  scale,
}: {
  screen: Screen;
  selectedStepId: string | null;
  interactive: boolean;
  scale: number;
}) {
  const { state, dispatch } = useStudio();
  const stepName = (id?: string) => screen.steps.find((s) => s.id === id)?.name;
  const emoji = state.tokens.voice.emoji ? ` ${emojiFor(state.tokens.voice)}` : '';

  return (
    <div
      style={{
        // WhatsApp-ish wallpaper, tinted from the token background.
        background:
          'linear-gradient(rgba(0,0,0,0.03), rgba(0,0,0,0.03)), var(--felix-color-background)',
        minHeight: 320,
        padding: 'var(--felix-space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--felix-space-4)',
      }}
    >
      {screen.steps.length === 0 && (
        <div
          style={{
            fontFamily: 'var(--felix-font-body)',
            fontSize: 'var(--felix-text-sm)',
            color: 'var(--felix-color-muted)',
            textAlign: 'center',
            padding: 'var(--felix-space-6)',
          }}
        >
          Empty flow — add a step in the inspector.
        </div>
      )}
      {screen.steps.map((step: ChatStep) => {
        const selected = step.id === selectedStepId;
        return (
          <div
            key={step.id}
            onClick={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              dispatch({
                type: 'select',
                selection: { kind: 'step', screenId: screen.id, stepId: step.id },
              });
            }}
            className="group relative"
            style={{ cursor: interactive ? 'default' : undefined }}
          >
            {/* Step name label, like a section marker */}
            <div
              style={{
                fontFamily: 'var(--felix-font-body)',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: selected ? '#3B82F6' : 'var(--felix-color-muted)',
                marginBottom: 'var(--felix-space-1)',
              }}
            >
              {step.name}
            </div>

            {/* Bot bubble */}
            <div
              style={{
                maxWidth: '85%',
                background: 'var(--felix-color-surface)',
                border: '1px solid var(--felix-color-border)',
                borderRadius: 'var(--felix-radius-lg)',
                borderTopLeftRadius: 'var(--felix-radius-sm)',
                boxShadow: 'var(--felix-shadow)',
                padding: 'var(--felix-space-2) var(--felix-space-3)',
                fontFamily: 'var(--felix-font-body)',
                fontSize: 'var(--felix-text-sm)',
                color: 'var(--felix-color-ink)',
                lineHeight: 1.5,
              }}
            >
              {step.message}
              {emoji}
              <span
                style={{
                  display: 'block',
                  textAlign: 'right',
                  fontSize: '10px',
                  color: 'var(--felix-color-muted)',
                  marginTop: 2,
                }}
              >
                9:41
              </span>
            </div>

            {/* Quick replies */}
            {step.replies.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--felix-space-1)',
                  marginTop: 'var(--felix-space-2)',
                }}
              >
                {step.replies.map((r, i) => {
                  const target = stepName(r.goTo);
                  const broken = r.goTo && !target;
                  return (
                    <span
                      key={i}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: 'var(--felix-font-body)',
                        fontSize: 'var(--felix-text-sm)',
                        fontWeight: 600,
                        color: broken ? 'var(--felix-color-danger)' : 'var(--felix-color-primary)',
                        background: 'var(--felix-color-surface)',
                        border: `1px solid ${broken ? 'var(--felix-color-danger)' : 'var(--felix-color-primary)'}`,
                        borderRadius: 'var(--felix-radius-full)',
                        padding: 'calc(var(--felix-space-1) * 0.8) var(--felix-space-3)',
                      }}
                    >
                      {r.label}
                      {target && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            fontSize: '10px',
                            fontWeight: 500,
                            color: 'var(--felix-color-muted)',
                          }}
                        >
                          <CornerDownRight size={10} />
                          {target}
                        </span>
                      )}
                      {broken && (
                        <span style={{ fontSize: '10px', fontWeight: 500 }}>→ missing step</span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Selection / hover outline */}
            <div
              className={
                'pointer-events-none absolute -inset-1 rounded ' +
                (selected ? '' : interactive ? 'group-hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.45)]' : '')
              }
              style={selected ? { boxShadow: `inset 0 0 0 ${2 / scale}px #3B82F6` } : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

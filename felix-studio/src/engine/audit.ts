/**
 * Maintenance: the audit walks the live product and the token set looking for
 * the classic ways a design system decays — drift (values that bypass tokens),
 * inaccessibility (token combinations that fail WCAG), and structural gaps.
 * Rules are surface-aware: web pages, native screens and chat flows each
 * decay in their own way.
 */
import { contrastRatio, TokenSet, bestTextOn } from '../felix/tokens';
import { AuditFinding, Screen } from './types';

export function runAudit(tokens: TokenSet, screens: Screen[]): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // 1. Drift: blocks styled outside the token system (any visual surface).
  for (const screen of screens) {
    for (const block of screen.blocks) {
      if (block.overrides && Object.keys(block.overrides).length > 0) {
        const parts = Object.entries(block.overrides)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        findings.push({
          severity: 'issue',
          title: `Token drift on “${screen.name}”`,
          detail: `The ${block.kind} block carries hard-coded overrides (${parts}) that bypass the token system. Say “fix drift” to snap it back to tokens.`,
        });
      }
    }
  }

  // 2. Accessibility: primary color vs. the text rendered on it.
  const onPrimary = bestTextOn(tokens.color.primary);
  const primaryContrast = contrastRatio(tokens.color.primary, onPrimary);
  if (primaryContrast < 4.5) {
    findings.push({
      severity: primaryContrast < 3 ? 'issue' : 'warning',
      title: 'Low contrast on primary actions',
      detail: `Text on the primary color measures ${primaryContrast.toFixed(2)}:1 (WCAG AA needs 4.5:1). Try a darker or more saturated primary.`,
    });
  }

  // 3. Accessibility: body text vs. background.
  const bodyContrast = contrastRatio(tokens.color.ink, tokens.color.background);
  if (bodyContrast < 4.5) {
    findings.push({
      severity: 'issue',
      title: 'Body text is hard to read',
      detail: `Ink on background measures ${bodyContrast.toFixed(2)}:1 — below the 4.5:1 AA threshold.`,
    });
  }

  // 4. Structure per surface.
  for (const screen of screens) {
    if (screen.surface === 'chat') {
      auditChatFlow(screen, findings);
      continue;
    }
    const kinds = screen.blocks.map((b) => b.kind);
    if (screen.surface === 'web' && screen.blocks.length > 0 && !kinds.includes('navbar')) {
      findings.push({
        severity: 'warning',
        title: `“${screen.name}” has no navigation`,
        detail: `Users can land here but not move on. Say “add a navbar to the ${screen.name.toLowerCase()} page”.`,
      });
    }
    if (kinds.filter((k) => k === 'hero').length > 1) {
      findings.push({
        severity: 'warning',
        title: `“${screen.name}” has multiple heroes`,
        detail: 'More than one hero dilutes the page’s single message. Consider demoting one to a feature section.',
      });
    }
    if (screen.blocks.length === 0) {
      findings.push({
        severity: 'warning',
        title: `“${screen.name}” is empty`,
        detail: `Say “add a hero to the ${screen.name.toLowerCase()} page” to start composing it.`,
      });
    }
  }

  if (findings.length === 0) {
    findings.push({
      severity: 'ok',
      title: 'No drift, no contrast failures, no dead ends',
      detail:
        'Every block reads from tokens, color pairings pass WCAG AA, and every chat reply leads somewhere. The system and the product are in sync.',
    });
  }

  return findings;
}

/** Conversational surfaces decay differently: dead ends, no exit to a human. */
function auditChatFlow(screen: Screen, findings: AuditFinding[]) {
  if (screen.steps.length === 0) {
    findings.push({
      severity: 'warning',
      title: `“${screen.name}” flow is empty`,
      detail: 'Add a welcome step so the conversation has somewhere to start.',
    });
    return;
  }
  const ids = new Set(screen.steps.map((s) => s.id));
  for (const step of screen.steps) {
    for (const reply of step.replies) {
      if (reply.goTo && !ids.has(reply.goTo)) {
        findings.push({
          severity: 'issue',
          title: `Dead end in “${screen.name}”`,
          detail: `The reply “${reply.label}” on step “${step.name}” points to a step that no longer exists. Re-wire it in the step inspector.`,
        });
      }
    }
    if (step.replies.length === 0) {
      findings.push({
        severity: 'warning',
        title: `“${step.name}” ends the conversation`,
        detail: `Step “${step.name}” in “${screen.name}” offers no replies — users have nowhere to go. Add a reply or route back to the start.`,
      });
    }
    if (step.message.length > 240) {
      findings.push({
        severity: 'warning',
        title: `Long message in “${screen.name}”`,
        detail: `Step “${step.name}” is ${step.message.length} characters. Chat reads best under ~240 — split it or tighten the copy.`,
      });
    }
  }
  const hasHandoff = screen.steps.some(
    (s) => /human|person|agent|team|staff/i.test(s.name) || /human|person|agent|someone from/i.test(s.message),
  );
  if (!hasHandoff) {
    findings.push({
      severity: 'warning',
      title: `“${screen.name}” has no human handoff`,
      detail: 'Every automated flow needs an exit to a person. Add a step that hands the thread to the team.',
    });
  }
}

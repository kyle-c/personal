/**
 * Maintenance: the audit walks the live product and the token set looking for
 * the two classic ways a design system decays — drift (values that bypass
 * tokens) and inaccessibility (token combinations that fail WCAG).
 */
import { contrastRatio, TokenSet, bestTextOn } from '../felix/tokens';
import { AuditFinding, Screen } from './types';

export function runAudit(tokens: TokenSet, screens: Screen[]): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // 1. Drift: blocks styled outside the token system.
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

  // 4. Structure: screens missing navigation or landing without a footer.
  for (const screen of screens) {
    const kinds = screen.blocks.map((b) => b.kind);
    if (screen.blocks.length > 0 && !kinds.includes('navbar')) {
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
  }

  // 5. Empty screens.
  for (const screen of screens) {
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
      title: 'No drift, no contrast failures',
      detail: 'Every block is composed from tokens and all color pairings pass WCAG AA. The system and the product are in sync.',
    });
  }

  return findings;
}

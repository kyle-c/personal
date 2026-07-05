import { TokenSet } from '../felix/tokens';
import { Business, Screen } from './types';

/** djb2 — stable, tiny fingerprint for export-staleness checks. */
function djb2(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

/**
 * Fingerprint of everything that shapes a screen's exported artifact: the
 * tokens, the business profile, and the screen's own content. If any of
 * these change after an export, the shipped artifact is stale.
 */
export function exportHash(screen: Screen, tokens: TokenSet, business: Business): string {
  return djb2(
    JSON.stringify({
      tokens,
      business,
      blocks: screen.blocks.map((b) => ({ kind: b.kind, props: b.props, overrides: b.overrides })),
      steps: screen.steps.map((s) => ({ name: s.name, message: s.message, replies: s.replies })),
      name: screen.name,
      surface: screen.surface,
    }),
  );
}

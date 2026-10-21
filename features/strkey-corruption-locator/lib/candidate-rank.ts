import { STRKEY_ALPHABET } from "@/features/strkey-corruption-locator/lib/strkey-alphabet";
import type { CorrectionCandidate } from "@/features/strkey-corruption-locator/types";

/**
 * How many corrections the panel renders.
 * Earlier positions sort first; the rest stay counted but hidden so a noisy checksum collision cannot flood the page.
 */
export const MAX_VISIBLE_CANDIDATES = 8;

export interface RankedCandidates {
  total: number;
  visible: CorrectionCandidate[];
}

export function rankCandidates(candidates: readonly CorrectionCandidate[]): RankedCandidates {
  const ranked = [...candidates].sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    return STRKEY_ALPHABET.indexOf(left.replacement) - STRKEY_ALPHABET.indexOf(right.replacement);
  });

  return {
    total: ranked.length,
    visible: ranked.slice(0, MAX_VISIBLE_CANDIDATES)
  };
}

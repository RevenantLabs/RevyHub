import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { rankCandidates } from "@/features/strkey-corruption-locator/lib/candidate-rank";
import { searchSingleCharSubstitutions } from "@/features/strkey-corruption-locator/lib/single-char-search";
import {
  MAX_STRKEY_LENGTH,
  classifyPublicStrKey,
  isSearchableLength,
  isSecretSeedShaped
} from "@/features/strkey-corruption-locator/lib/strkey-alphabet";
import type {
  StrkeyCorruptionLocatorErrorCode,
  StrkeyCorruptionLocatorInput,
  StrkeyCorruptionLocatorResult
} from "@/features/strkey-corruption-locator/types";

/**
 * Locates a single-character StrKey corruption.
 * Expected failures are codes. A string with no one-character fix is a successful no-candidates report.
 */
export function locateStrKeyCorruption(
  value: string
): Result<StrkeyCorruptionLocatorResult, StrkeyCorruptionLocatorErrorCode> {
  if (isSecretSeedShaped(value)) return err("contains_secret_seed");
  if (value.length > MAX_STRKEY_LENGTH) return err("too_long");
  if (!isSearchableLength(value.length)) return err("invalid_length");
  if (classifyPublicStrKey(value)) return err("already_valid");

  const ranked = rankCandidates(searchSingleCharSubstitutions(value));
  if (ranked.total === 0) {
    return ok({ outcome: "no_candidates", code: "no_candidates_found", length: value.length });
  }

  return ok({
    outcome: "candidates",
    length: value.length,
    totalCandidates: ranked.total,
    candidates: ranked.visible
  });
}

function waitForLocalScan(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 0);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });
}

/**
 * Offline orchestration entry point.
 * The zero-delay yield lets the panel paint its loading state before the local scan finishes.
 */
export async function runStrkeyCorruptionLocator(
  input: StrkeyCorruptionLocatorInput,
  _network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<StrkeyCorruptionLocatorResult, StrkeyCorruptionLocatorErrorCode>> {
  await waitForLocalScan(signal);
  return locateStrKeyCorruption(input.value);
}

import { SecretSeedSearchError } from "@/features/strkey-corruption-locator/lib/single-char-search";
import type { StrkeyCorruptionLocatorErrorCode } from "@/features/strkey-corruption-locator/types";

const REDACTED: readonly StrkeyCorruptionLocatorErrorCode[] = ["contains_secret_seed"];

/** Codes that must never cause the submitted text to be rendered or stored. */
export function shouldRedact(code: StrkeyCorruptionLocatorErrorCode): boolean {
  return REDACTED.includes(code);
}

/**
 * Maps an unexpected thrown decoder onto this tool's codes.
 * The locator is fully offline, so there is no transport failure to classify.
 */
export function toStrkeyCorruptionLocatorErrorCode(error: unknown): StrkeyCorruptionLocatorErrorCode {
  if (error instanceof SecretSeedSearchError) return "contains_secret_seed";
  if (error instanceof Error && /too long/i.test(error.message)) return "too_long";
  return "invalid_length";
}

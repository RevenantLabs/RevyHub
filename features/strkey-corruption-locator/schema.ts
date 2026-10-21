import { err, ok, type Result } from "@/core/result/result";
import {
  MAX_STRKEY_LENGTH,
  isSearchableLength,
  isSecretSeedShaped
} from "@/features/strkey-corruption-locator/lib/strkey-alphabet";
import type {
  StrkeyCorruptionLocatorErrorCode,
  StrkeyCorruptionLocatorInput
} from "@/features/strkey-corruption-locator/types";

/**
 * Parses raw form input without making a request.
 * Whitespace is removed entirely because wrapped pastes split a StrKey across lines.
 * A secret-seed version byte is rejected here so the search never sees it.
 */
export function parseStrkeyCorruptionLocatorInput(
  raw: string
): Result<StrkeyCorruptionLocatorInput, StrkeyCorruptionLocatorErrorCode> {
  const value = raw.replace(/\s+/g, "");
  if (!value) return err("empty_input");
  if (isSecretSeedShaped(value)) return err("contains_secret_seed");
  if (value.length > MAX_STRKEY_LENGTH) return err("too_long");
  if (!isSearchableLength(value.length)) return err("invalid_length");
  return ok({ value });
}

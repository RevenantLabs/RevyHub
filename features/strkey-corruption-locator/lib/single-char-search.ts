import {
  STRKEY_ALPHABET_CHARACTERS,
  classifyPublicStrKey,
  isSecretSeedShaped
} from "@/features/strkey-corruption-locator/lib/strkey-alphabet";
import type { CorrectionCandidate } from "@/features/strkey-corruption-locator/types";

/** Thrown when a caller asks to search a secret seed. The message never includes the input. */
export class SecretSeedSearchError extends Error {
  constructor() {
    super("Refusing to search a secret-seed-shaped string");
    this.name = "SecretSeedSearchError";
  }
}

/** Thrown when a caller asks to search a StrKey the SDK already accepts. */
export class AlreadyValidSearchError extends Error {
  constructor() {
    super("Refusing to search a StrKey that already validates");
    this.name = "AlreadyValidSearchError";
  }
}

function substitute(value: string, position: number, replacement: string): string {
  return `${value.slice(0, position)}${replacement}${value.slice(position + 1)}`;
}

/**
 * Tries every StrKey-alphabet substitution at every position.
 * A candidate is kept only when `StrKey` accepts the checksum and the result is not a secret seed.
 */
export function searchSingleCharSubstitutions(value: string): CorrectionCandidate[] {
  if (isSecretSeedShaped(value)) throw new SecretSeedSearchError();
  if (classifyPublicStrKey(value)) throw new AlreadyValidSearchError();

  const matches: CorrectionCandidate[] = [];

  for (let position = 0; position < value.length; position += 1) {
    const originalCharacter = value[position] ?? "";

    for (const replacement of STRKEY_ALPHABET_CHARACTERS) {
      if (replacement === originalCharacter) continue;

      const corrected = substitute(value, position, replacement);
      if (isSecretSeedShaped(corrected)) continue;

      const kind = classifyPublicStrKey(corrected);
      if (!kind) continue;

      matches.push({ position, originalCharacter, replacement, corrected, kind });
    }
  }

  return matches;
}

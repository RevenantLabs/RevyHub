import { Keypair } from "@stellar/stellar-sdk";
import { STRKEY_ALPHABET } from "@/features/strkey-corruption-locator/lib/strkey-alphabet";
import { searchSingleCharSubstitutions } from "@/features/strkey-corruption-locator/lib/single-char-search";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

function otherCharacter(character: string): string {
  return character === "A" ? "C" : "A";
}

function replaceAt(value: string, index: number, character: string): string {
  return `${value.slice(0, index)}${character}${value.slice(index + 1)}`;
}

/**
 * Two substitutions on a derived public key.
 * A one-character search cannot repair both edits. If a checksum collision still validates,
 * the next pair of positions is tried so the exported string stays unfixable.
 */
function buildUnfixableString(): string {
  const key = seed(8).publicKey();

  for (let left = 1; left < key.length - 1; left += 1) {
    for (let right = left + 1; right < key.length; right += 1) {
      const candidate = replaceAt(
        replaceAt(key, left, otherCharacter(key[left] ?? "B")),
        right,
        otherCharacter(key[right] ?? "B")
      );
      const alphabetOnly = [...candidate].every((character) => STRKEY_ALPHABET.includes(character));
      if (!alphabetOnly) continue;
      if (searchSingleCharSubstitutions(candidate).length === 0) return candidate;
    }
  }

  throw new Error("Could not derive an unfixable StrKey-length string from the fixed seed");
}

export const unfixableString = buildUnfixableString();

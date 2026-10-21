import { describe, expect, it } from "vitest";
import {
  AlreadyValidSearchError,
  SecretSeedSearchError,
  searchSingleCharSubstitutions
} from "@/features/strkey-corruption-locator/lib/single-char-search";
import {
  originalPublicKey,
  seedShapedNearMiss,
  singleCharTypo,
  typoPosition
} from "@/features/strkey-corruption-locator/fixtures/single-char-typo.fixture";
import { secretSeed, validPublicKey } from "@/features/strkey-corruption-locator/fixtures/strkeyCorruptionLocator.fixture";

describe("searchSingleCharSubstitutions", () => {
  it("recovers the original public key from a known one-character typo", () => {
    const matches = searchSingleCharSubstitutions(singleCharTypo);
    const recovered = matches.find((candidate) => candidate.corrected === originalPublicKey);

    expect(recovered).toMatchObject({
      position: typoPosition,
      corrected: originalPublicKey,
      kind: "ed25519PublicKey"
    });
  });

  it("never returns a secret-seed-shaped correction", () => {
    const matches = searchSingleCharSubstitutions(singleCharTypo);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((candidate) => !candidate.corrected.startsWith("S"))).toBe(true);
  });

  it("refuses to search a secret seed and does not echo it", () => {
    expect(() => searchSingleCharSubstitutions(secretSeed)).toThrow(SecretSeedSearchError);
    try {
      searchSingleCharSubstitutions(secretSeed);
    } catch (error) {
      expect(error).toBeInstanceOf(SecretSeedSearchError);
      expect((error as Error).message).not.toContain(secretSeed);
    }
  });

  it("refuses to search a seed-shaped near miss of a public key", () => {
    expect(() => searchSingleCharSubstitutions(seedShapedNearMiss)).toThrow(SecretSeedSearchError);
  });

  it("refuses to search a StrKey that already validates", () => {
    expect(() => searchSingleCharSubstitutions(validPublicKey)).toThrow(AlreadyValidSearchError);
  });
});

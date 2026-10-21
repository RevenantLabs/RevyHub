import { describe, expect, it } from "vitest";
import { locateStrKeyCorruption } from "@/features/strkey-corruption-locator/lib/strkeyCorruptionLocator";
import {
  shouldRedact,
  toStrkeyCorruptionLocatorErrorCode
} from "@/features/strkey-corruption-locator/lib/strkeyCorruptionLocator.errors";
import { SecretSeedSearchError } from "@/features/strkey-corruption-locator/lib/single-char-search";
import { MAX_STRKEY_LENGTH } from "@/features/strkey-corruption-locator/lib/strkey-alphabet";
import {
  originalPublicKey,
  seedShapedNearMiss,
  singleCharTypo
} from "@/features/strkey-corruption-locator/fixtures/single-char-typo.fixture";
import { unfixableString } from "@/features/strkey-corruption-locator/fixtures/unfixable-string.fixture";
import { contractAddress, secretSeed, validPublicKey } from "@/features/strkey-corruption-locator/fixtures/strkeyCorruptionLocator.fixture";

describe("locateStrKeyCorruption", () => {
  it("recovers the original public key for a known single-character typo", () => {
    const result = locateStrKeyCorruption(singleCharTypo);

    expect(result.ok).toBe(true);
    if (!result.ok || result.value.outcome !== "candidates") return;
    expect(result.value.candidates.some((candidate) => candidate.corrected === originalPublicKey)).toBe(true);
  });

  it("rejects a valid public key without printing a correction", () => {
    const result = locateStrKeyCorruption(validPublicKey);

    expect(result).toEqual({ ok: false, code: "already_valid" });
    expect(JSON.stringify(result)).not.toContain(validPublicKey);
  });

  it("rejects a valid contract StrKey the same way", () => {
    expect(locateStrKeyCorruption(contractAddress)).toEqual({ ok: false, code: "already_valid" });
  });

  it("rejects a secret seed without searching or echoing it", () => {
    const result = locateStrKeyCorruption(secretSeed);

    expect(result).toEqual({ ok: false, code: "contains_secret_seed" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("does not recover a public key from a seed-shaped near miss", () => {
    const result = locateStrKeyCorruption(seedShapedNearMiss);

    expect(result).toEqual({ ok: false, code: "contains_secret_seed" });
    expect(JSON.stringify(result)).not.toContain(originalPublicKey);
    expect(JSON.stringify(result)).not.toContain(seedShapedNearMiss);
  });

  it("reports an unfixable string as no candidates, not an error", () => {
    const result = locateStrKeyCorruption(unfixableString);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      outcome: "no_candidates",
      code: "no_candidates_found",
      length: unfixableString.length
    });
  });

  it("rejects lengths outside the StrKey window", () => {
    expect(locateStrKeyCorruption("A".repeat(10))).toEqual({ ok: false, code: "invalid_length" });
    expect(locateStrKeyCorruption("A".repeat(MAX_STRKEY_LENGTH + 1))).toEqual({ ok: false, code: "too_long" });
  });
});

describe("error mapping", () => {
  it("redacts only secret-seed failures", () => {
    expect(shouldRedact("contains_secret_seed")).toBe(true);
    expect(shouldRedact("already_valid")).toBe(false);
    expect(shouldRedact("no_candidates_found")).toBe(false);
  });

  it("maps a forbidden secret search and a length failure", () => {
    expect(toStrkeyCorruptionLocatorErrorCode(new SecretSeedSearchError())).toBe("contains_secret_seed");
    expect(toStrkeyCorruptionLocatorErrorCode(new Error("value too long"))).toBe("too_long");
    expect(toStrkeyCorruptionLocatorErrorCode(new Error("invalid checksum"))).toBe("invalid_length");
  });
});

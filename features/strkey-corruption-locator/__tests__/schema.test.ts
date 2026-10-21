import { describe, expect, it } from "vitest";
import { parseStrkeyCorruptionLocatorInput } from "@/features/strkey-corruption-locator/schema";
import { MAX_STRKEY_LENGTH } from "@/features/strkey-corruption-locator/lib/strkey-alphabet";
import { singleCharTypo } from "@/features/strkey-corruption-locator/fixtures/single-char-typo.fixture";
import { secretSeed, validPublicKey } from "@/features/strkey-corruption-locator/fixtures/strkeyCorruptionLocator.fixture";

describe("parseStrkeyCorruptionLocatorInput", () => {
  it("rejects empty and whitespace-only input", () => {
    expect(parseStrkeyCorruptionLocatorInput("")).toEqual({ ok: false, code: "empty_input" });
    expect(parseStrkeyCorruptionLocatorInput(" \n\t ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("strips whitespace from a wrapped paste", () => {
    const wrapped = `${singleCharTypo.slice(0, 20)}\n  ${singleCharTypo.slice(20)}`;
    const result = parseStrkeyCorruptionLocatorInput(wrapped);

    expect(result.ok && result.value.value).toBe(singleCharTypo);
  });

  it("rejects a secret seed before any other check and does not keep it", () => {
    const result = parseStrkeyCorruptionLocatorInput(`  ${secretSeed}  `);

    expect(result).toEqual({ ok: false, code: "contains_secret_seed" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("rejects a short string and a string past the SDK maximum", () => {
    expect(parseStrkeyCorruptionLocatorInput("G".repeat(12))).toEqual({ ok: false, code: "invalid_length" });
    expect(parseStrkeyCorruptionLocatorInput("G".repeat(MAX_STRKEY_LENGTH + 5))).toEqual({
      ok: false,
      code: "too_long"
    });
  });

  it("accepts a valid-length public key for the locator to classify", () => {
    const result = parseStrkeyCorruptionLocatorInput(validPublicKey);

    expect(result.ok && result.value.value).toBe(validPublicKey);
  });
});

import { Networks } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import {
  MAX_ENVELOPE_LENGTH,
  MAX_PASSPHRASE_LENGTH,
  parseFeeBumpInput
} from "@/features/fee-bump-inspector/schema";
import {
  feeBumpXdr,
  notBase64,
  secretSeed
} from "@/features/fee-bump-inspector/fixtures/feeBumpInspector.fixture";

const passphrase = Networks.TESTNET;

describe("parseFeeBumpInput", () => {
  it("rejects an empty envelope", () => {
    expect(parseFeeBumpInput({ envelope: "  \n ", networkPassphrase: passphrase })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("rejects text that is not base64", () => {
    expect(parseFeeBumpInput({ envelope: notBase64, networkPassphrase: passphrase })).toEqual({
      ok: false,
      code: "invalid_input"
    });
  });

  it("rejects base64 whose length is not a multiple of four", () => {
    expect(parseFeeBumpInput({ envelope: "AAAAA", networkPassphrase: passphrase })).toEqual({
      ok: false,
      code: "invalid_input"
    });
  });

  it("refuses a secret seed without echoing it", () => {
    const result = parseFeeBumpInput({ envelope: secretSeed, networkPassphrase: passphrase });

    // The detail says why so the UI can clear the field; it never carries the value.
    expect(result).toEqual({ ok: false, code: "invalid_input", detail: "secret_key" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("flags only a secret seed for redaction, not any other bad paste", () => {
    const badPaste = parseFeeBumpInput({ envelope: notBase64, networkPassphrase: passphrase });

    expect(badPaste).toEqual({ ok: false, code: "invalid_input" });
    expect(badPaste.ok === false && badPaste.detail).toBeUndefined();
  });

  it("accepts an envelope exactly at the length cap", () => {
    const atCap = "A".repeat(MAX_ENVELOPE_LENGTH);
    expect(parseFeeBumpInput({ envelope: atCap, networkPassphrase: passphrase }).ok).toBe(true);
  });

  it("rejects an envelope one character past the cap", () => {
    // One past the cap is still a multiple of four, so only the bound can reject it.
    const pastCap = "A".repeat(MAX_ENVELOPE_LENGTH + 4);
    expect(parseFeeBumpInput({ envelope: pastCap, networkPassphrase: passphrase })).toEqual({
      ok: false,
      code: "input_too_large"
    });
  });

  it("rejects a missing passphrase separately from a missing envelope", () => {
    expect(parseFeeBumpInput({ envelope: feeBumpXdr, networkPassphrase: "   " })).toEqual({
      ok: false,
      code: "empty_passphrase"
    });
  });

  it("rejects an oversized passphrase", () => {
    expect(
      parseFeeBumpInput({
        envelope: feeBumpXdr,
        networkPassphrase: "x".repeat(MAX_PASSPHRASE_LENGTH + 1)
      })
    ).toEqual({ ok: false, code: "input_too_large" });
  });

  it("accepts a passphrase exactly at the cap", () => {
    expect(
      parseFeeBumpInput({
        envelope: feeBumpXdr,
        networkPassphrase: "x".repeat(MAX_PASSPHRASE_LENGTH)
      }).ok
    ).toBe(true);
  });

  it("strips whitespace from a wrapped paste and trims the passphrase", () => {
    const wrapped = `${feeBumpXdr.slice(0, 40)}\n  ${feeBumpXdr.slice(40)}`;
    const result = parseFeeBumpInput({
      envelope: wrapped,
      networkPassphrase: `  ${passphrase}  `
    });

    expect(result.ok && result.value).toEqual({
      envelope: feeBumpXdr,
      networkPassphrase: passphrase
    });
  });
});

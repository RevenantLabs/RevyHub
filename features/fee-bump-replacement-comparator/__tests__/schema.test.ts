import { describe, expect, it } from "vitest";
import {
  MAX_ENVELOPE_LENGTH,
  MAX_PASSPHRASE_LENGTH,
  parseFeeBumpReplacementComparatorInput,
  sideFor
} from "@/features/fee-bump-replacement-comparator/schema";
import {
  PASSPHRASE,
  currentFeeBumpXdr,
  higherFeeBumpXdr,
  whitespaceCurrentXdr
} from "@/features/fee-bump-replacement-comparator/fixtures/normal.fixture";
import {
  notBase64,
  secretSeed
} from "@/features/fee-bump-replacement-comparator/fixtures/boundary.fixture";

const base = {
  left: currentFeeBumpXdr,
  right: higherFeeBumpXdr,
  networkPassphrase: PASSPHRASE
};

describe("parseFeeBumpReplacementComparatorInput", () => {
  it("requires both envelopes and a passphrase", () => {
    expect(parseFeeBumpReplacementComparatorInput({ ...base, left: "" })).toEqual({
      ok: false,
      code: "empty_input"
    });
    expect(parseFeeBumpReplacementComparatorInput({ ...base, right: "  " })).toEqual({
      ok: false,
      code: "empty_input"
    });
    expect(parseFeeBumpReplacementComparatorInput({ ...base, networkPassphrase: " " })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("attributes malformed base64 to the side it came from", () => {
    expect(parseFeeBumpReplacementComparatorInput({ ...base, left: notBase64 })).toEqual({
      ok: false,
      code: "invalid_input",
      detail: "left"
    });
    expect(parseFeeBumpReplacementComparatorInput({ ...base, right: notBase64 })).toEqual({
      ok: false,
      code: "invalid_input",
      detail: "right"
    });
  });

  it("refuses a secret seed on either side without echoing it", () => {
    const left = parseFeeBumpReplacementComparatorInput({ ...base, left: secretSeed });
    const right = parseFeeBumpReplacementComparatorInput({ ...base, right: secretSeed });

    expect(left).toEqual({ ok: false, code: "invalid_input", detail: "secret_key" });
    expect(right).toEqual({ ok: false, code: "invalid_input", detail: "secret_key" });
    expect(JSON.stringify([left, right])).not.toContain(secretSeed);
  });

  it("strips whitespace from both sides", () => {
    const result = parseFeeBumpReplacementComparatorInput({
      ...base,
      left: whitespaceCurrentXdr
    });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.left).toBe(currentFeeBumpXdr);
  });

  it("trims the passphrase", () => {
    const result = parseFeeBumpReplacementComparatorInput({
      ...base,
      networkPassphrase: `  ${PASSPHRASE}  `
    });
    expect(result.ok && result.value.networkPassphrase).toBe(PASSPHRASE);
  });

  it("accepts an envelope exactly at the cap and rejects one past it", () => {
    expect(
      parseFeeBumpReplacementComparatorInput({
        ...base,
        left: "A".repeat(MAX_ENVELOPE_LENGTH)
      }).ok
    ).toBe(true);
    expect(
      parseFeeBumpReplacementComparatorInput({
        ...base,
        left: "A".repeat(MAX_ENVELOPE_LENGTH + 4)
      })
    ).toEqual({ ok: false, code: "too_large" });
  });

  it("rejects an oversized passphrase", () => {
    expect(
      parseFeeBumpReplacementComparatorInput({
        ...base,
        networkPassphrase: "x".repeat(MAX_PASSPHRASE_LENGTH + 1)
      })
    ).toEqual({ ok: false, code: "too_large" });
  });

  it("maps detail back to a form side when present", () => {
    expect(sideFor("invalid_input", "left")).toBe("left");
    expect(sideFor("malformed_data", "right")).toBe("right");
    expect(sideFor("empty_input")).toBeNull();
  });
});

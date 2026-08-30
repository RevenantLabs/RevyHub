import { describe, expect, it } from "vitest";
import { parseBatchAddressValidatorInput, MAX_LINES } from "@/features/batch-address-validator/schema";
import { validPublicKey } from "@/features/address-validator/fixtures/addressValidator.fixture";

describe("parseBatchAddressValidatorInput", () => {
  it("rejects empty input", () => {
    const result = parseBatchAddressValidatorInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects input with no address tokens", () => {
    const result = parseBatchAddressValidatorInput(" , \n , ");
    expect(result).toEqual({ ok: false, code: "no_valid_lines" });
  });

  it("rejects more than the row limit", () => {
    const lines = Array.from({ length: MAX_LINES + 1 }, () => validPublicKey);
    const result = parseBatchAddressValidatorInput(lines.join("\n"));
    expect(result).toEqual({ ok: false, code: "too_many_lines" });
  });

  it("accepts input at the row limit", () => {
    const lines = Array.from({ length: MAX_LINES }, () => validPublicKey);
    const result = parseBatchAddressValidatorInput(lines.join("\n"));
    expect(result.ok && result.value.lines).toHaveLength(MAX_LINES);
  });

  it("splits comma-separated addresses", () => {
    const result = parseBatchAddressValidatorInput(`${validPublicKey}, ${validPublicKey}`);
    expect(result.ok && result.value.lines).toHaveLength(2);
  });
});

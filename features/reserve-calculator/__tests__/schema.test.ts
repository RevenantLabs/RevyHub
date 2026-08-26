import { describe, expect, it } from "vitest";
import { parseReserveCalculatorInput } from "@/features/reserve-calculator/schema";
import { accountId } from "@/features/reserve-calculator/fixtures/reserveCalculator.fixture";

describe("parseReserveCalculatorInput", () => {
  it("rejects empty input", () => {
    const result = parseReserveCalculatorInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects an address that fails the StrKey checksum", () => {
    expect(parseReserveCalculatorInput(accountId.slice(0, -1))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("rejects a secret seed on its prefix without retaining it", () => {
    const secret = "S".repeat(56);
    const result = parseReserveCalculatorInput(secret);
    expect(result).toEqual({ ok: false, code: "invalid_address" });
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it("accepts a checksummed G-address with whitespace", () => {
    const result = parseReserveCalculatorInput(`  ${accountId}\n`);
    expect(result.ok && result.value.accountId).toBe(accountId);
  });
});

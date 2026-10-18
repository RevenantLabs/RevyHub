import { describe, expect, it } from "vitest";
import { parseTransactionFeeChargeAuditInput } from "@/features/transaction-fee-charge-audit/schema";

describe("parseTransactionFeeChargeAuditInput", () => {
  it("rejects empty input", () => {
    expect(parseTransactionFeeChargeAuditInput("   ")).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("rejects a malformed hash", () => {
    expect(parseTransactionFeeChargeAuditInput("GABC")).toEqual({
      ok: false,
      code: "invalid_hash"
    });
    expect(parseTransactionFeeChargeAuditInput("abc")).toEqual({
      ok: false,
      code: "invalid_hash"
    });
  });

  it("accepts a 64-character hex hash and lowercases it", () => {
    const hash = "A".repeat(64);
    expect(parseTransactionFeeChargeAuditInput(`  ${hash}  `)).toEqual({
      ok: true,
      value: { hash: "a".repeat(64) }
    });
  });

  it("strips internal whitespace from pasted hashes", () => {
    const parts = ["a".repeat(32), "b".repeat(32)];
    expect(parseTransactionFeeChargeAuditInput(`${parts[0]} ${parts[1]}`)).toEqual({
      ok: true,
      value: { hash: parts.join("") }
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  isLikelyTransactionHash,
  parseTransactionInput
} from "@/features/transaction-lookup/schema";
import { sourceAccount } from "@/features/transaction-lookup/fixtures/transactionLookup.fixture";

describe("isLikelyTransactionHash", () => {
  it("accepts exactly 64 hexadecimal characters", () => {
    expect(isLikelyTransactionHash("a".repeat(64))).toBe(true);
    expect(isLikelyTransactionHash("ABCDEF0123456789".repeat(4))).toBe(true);
  });

  it("rejects the wrong length", () => {
    expect(isLikelyTransactionHash("a".repeat(63))).toBe(false);
    expect(isLikelyTransactionHash("a".repeat(65))).toBe(false);
  });

  it("rejects non-hexadecimal characters", () => {
    expect(isLikelyTransactionHash("z".repeat(64))).toBe(false);
  });
});

describe("parseTransactionInput", () => {
  it("rejects empty input", () => {
    expect(parseTransactionInput("   ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects an account address with its own code", () => {
    expect(parseTransactionInput(sourceAccount)).toEqual({
      ok: false,
      code: "invalid_hash"
    });
  });

  it("lower-cases the hash to match Horizon's rendering", () => {
    const result = parseTransactionInput("ABCDEF0123456789".repeat(4));
    expect(result.ok && result.value.hash).toBe("abcdef0123456789".repeat(4));
  });

  it("strips whitespace from a wrapped paste", () => {
    const hash = "a".repeat(64);
    const result = parseTransactionInput(`${hash.slice(0, 30)}\n ${hash.slice(30)}`);
    expect(result.ok && result.value.hash).toBe(hash);
  });
});

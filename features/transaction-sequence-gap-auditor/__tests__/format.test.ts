import { describe, expect, it } from "vitest";
import {
  formatGapKind,
  formatMissingCount,
  formatNetwork,
  formatSequence,
  shortenHash
} from "@/features/transaction-sequence-gap-auditor/lib/format";
import { errorCopy } from "@/features/transaction-sequence-gap-auditor/copy";
import type { ErrorCode } from "@/features/transaction-sequence-gap-auditor/types";

describe("format helpers", () => {
  it("keeps sequence values lossless", () => {
    expect(formatSequence(9_223_372_036_854_775_807n)).toBe("9223372036854775807");
    expect(formatMissingCount("2")).toContain("2");
  });

  it("formats labels and hashes", () => {
    expect(formatGapKind("proved_bump")).toMatch(/bump/i);
    expect(formatNetwork("testnet")).toBe("Testnet");
    expect(shortenHash("1234567890abcdef")).toBe("1234…cdef");
  });

  it("provides actionable copy for every error code", () => {
    const codes: ErrorCode[] = [
      "invalid_input",
      "malformed_data",
      "unsupported_variant",
      "too_large",
      "not_found",
      "rate_limited",
      "request_failed"
    ];
    for (const code of codes) {
      expect(errorCopy[code].title).not.toBe("");
      expect(errorCopy[code].description.length).toBeGreaterThan(10);
    }
  });
});

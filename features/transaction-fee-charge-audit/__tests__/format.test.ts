import { describe, expect, it } from "vitest";
import {
  formatBaseFee,
  formatEnvelopeKind,
  formatLedgerSequence,
  formatNetwork,
  formatOperationCount,
  formatStroops,
  formatTimestamp,
  stroopsToXlm
} from "@/features/transaction-fee-charge-audit/lib/format";

describe("stroopsToXlm", () => {
  it("converts whole XLM amounts", () => {
    expect(stroopsToXlm("10000000")).toBe("1");
  });

  it("keeps fractional stroops without trailing zeros", () => {
    expect(stroopsToXlm("100")).toBe("0.00001");
  });
});

describe("formatStroops", () => {
  it("shows stroops and XLM together", () => {
    expect(formatStroops("100")).toBe("100 stroops (0.00001 XLM)");
  });
});

describe("formatEnvelopeKind", () => {
  it("labels classic and fee-bump envelopes", () => {
    expect(formatEnvelopeKind("classic")).toBe("Classic");
    expect(formatEnvelopeKind("fee_bump")).toBe("Fee-bump");
  });
});

describe("formatNetwork", () => {
  it("uses the shared network labels", () => {
    expect(formatNetwork("testnet")).toBe("Testnet");
    expect(formatNetwork("mainnet")).toBe("Mainnet");
  });
});

describe("formatLedgerSequence", () => {
  it("stringifies the sequence", () => {
    expect(formatLedgerSequence(42)).toBe("42");
  });
});

describe("formatTimestamp", () => {
  it("formats ISO timestamps", () => {
    expect(formatTimestamp("2026-05-02T10:14:05.000Z")).toBe("2026-05-02 10:14:05 UTC");
  });

  it("reports missing timestamps", () => {
    expect(formatTimestamp(null)).toBe("Not reported");
  });
});

describe("formatBaseFee", () => {
  it("formats or reports absence", () => {
    expect(formatBaseFee("100")).toBe("100 stroops (0.00001 XLM)");
    expect(formatBaseFee(null)).toBe("Not reported");
  });
});

describe("formatOperationCount", () => {
  it("stringifies the count", () => {
    expect(formatOperationCount(3)).toBe("3");
  });
});

import { describe, expect, it } from "vitest";
import {
  formatAmountDifference,
  formatFeeAmount,
  formatIngestionState,
  formatLedgerSequence,
  formatObservationTime,
  formatProtocolVersion,
  formatReserveAmount,
  stroopsToXlm
} from "@/features/network-comparison/lib/format";
import { copy } from "@/features/network-comparison/copy";

describe("stroopsToXlm", () => {
  it("converts 100 stroops into fractional XLM", () => {
    expect(stroopsToXlm("100")).toBe("0.00001 XLM");
  });

  it("converts base reserve 5,000,000 stroops into 0.5 XLM", () => {
    expect(stroopsToXlm("5000000")).toBe("0.5 XLM");
  });

  it("converts whole XLM amounts", () => {
    expect(stroopsToXlm("10000000")).toBe("1.0 XLM");
    expect(stroopsToXlm("20000000")).toBe("2.0 XLM");
  });

  it("converts mixed whole and fractional amounts", () => {
    expect(stroopsToXlm("15500000")).toBe("1.55 XLM");
  });

  it("handles negative values for differences", () => {
    expect(stroopsToXlm("-100")).toBe("-0.00001 XLM");
  });
});

describe("formatLedgerSequence", () => {
  it("formats valid ledger sequence with thousands separator", () => {
    expect(formatLedgerSequence(1_234_567)).toBe("#1,234,567");
  });

  it("returns unavailable when sequence is null or undefined", () => {
    expect(formatLedgerSequence(null)).toBe(copy.unavailable);
  });
});

describe("formatProtocolVersion", () => {
  it("formats valid protocol version", () => {
    expect(formatProtocolVersion(21)).toBe("Protocol 21");
  });

  it("returns unavailable when version is null", () => {
    expect(formatProtocolVersion(null)).toBe(copy.unavailable);
  });
});

describe("formatFeeAmount", () => {
  it("formats base fee with stroops and XLM", () => {
    expect(formatFeeAmount("100")).toBe("100 stroops (0.00001 XLM)");
  });

  it("returns unavailable when stroops is null", () => {
    expect(formatFeeAmount(null)).toBe(copy.unavailable);
  });
});

describe("formatReserveAmount", () => {
  it("formats base reserve with stroops and XLM", () => {
    expect(formatReserveAmount("5000000")).toBe("5,000,000 stroops (0.5 XLM)");
  });

  it("returns unavailable when reserve is null", () => {
    expect(formatReserveAmount(null)).toBe(copy.unavailable);
  });
});

describe("formatIngestionState", () => {
  it("reports up to date when ingested ledger matches history", () => {
    expect(formatIngestionState(1_234_567, 1_234_567)).toBe(copy.ingestionUpToDate);
  });

  it("reports lagging ledgers when history is ahead", () => {
    expect(formatIngestionState(1_234_560, 1_234_567)).toBe("Lagging by 7 ledgers");
  });

  it("returns unavailable when either sequence is null", () => {
    expect(formatIngestionState(null, 1_234_567)).toBe(copy.unavailable);
    expect(formatIngestionState(1_234_567, null)).toBe(copy.unavailable);
  });
});

describe("formatObservationTime", () => {
  it("returns provided timestamp string", () => {
    const ts = "2026-09-12T05:00:00Z";
    expect(formatObservationTime(ts)).toBe(ts);
  });

  it("returns unavailable when timestamp is empty or null", () => {
    expect(formatObservationTime(null)).toBe(copy.unavailable);
  });
});

describe("formatAmountDifference", () => {
  it("reports identical when difference is zero", () => {
    expect(formatAmountDifference("0")).toBe(copy.identical);
  });

  it("reports positive difference with sign and formatted units", () => {
    expect(formatAmountDifference("100")).toBe("+100 stroops (0.00001 XLM)");
  });

  it("reports negative difference with sign and formatted units", () => {
    expect(formatAmountDifference("-100")).toBe("-100 stroops (0.00001 XLM)");
  });

  it("returns unavailable when diff is null", () => {
    expect(formatAmountDifference(null)).toBe(copy.unavailable);
  });
});

import { describe, expect, it } from "vitest";
import { parseLedgerLookupInput } from "@/features/ledger-lookup/schema";

describe("parseLedgerLookupInput", () => {
  it("rejects empty input", () => {
    const result = parseLedgerLookupInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace and parses valid sequence", () => {
    const result = parseLedgerLookupInput("  50000000  ");
    expect(result).toEqual({ ok: true, value: { sequence: 50_000_000 } });
  });

  it("rejects zero", () => {
    const result = parseLedgerLookupInput("0");
    expect(result).toEqual({ ok: false, code: "invalid_sequence" });
  });

  it("rejects negative numbers", () => {
    const result = parseLedgerLookupInput("-123");
    expect(result).toEqual({ ok: false, code: "invalid_sequence" });
  });

  it("rejects non-numeric characters", () => {
    const result = parseLedgerLookupInput("123a45");
    expect(result).toEqual({ ok: false, code: "invalid_sequence" });
  });

  it("rejects decimal numbers", () => {
    const result = parseLedgerLookupInput("123.45");
    expect(result).toEqual({ ok: false, code: "invalid_sequence" });
  });

  it("rejects sequence exceeding 32-bit unsigned limit", () => {
    const result = parseLedgerLookupInput("4294967296");
    expect(result).toEqual({ ok: false, code: "invalid_sequence" });
  });
});

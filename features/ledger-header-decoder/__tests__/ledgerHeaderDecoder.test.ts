import { describe, expect, it } from "vitest";
import { runLedgerHeaderDecoder } from "@/features/ledger-header-decoder/lib/ledgerHeaderDecoder";
import { ledgerHeaderXdr } from "@/features/ledger-header-decoder/fixtures/ledgerHeaderDecoder.fixture";
import { MAX_XDR_LENGTH } from "@/features/ledger-header-decoder/schema";
import { errorCopy } from "@/features/ledger-header-decoder/copy";

describe("decoder orchestration", () => {
  it("accepts a complete header", () => expect(runLedgerHeaderDecoder(ledgerHeaderXdr).ok).toBe(true));
  it.each([
    ["", "empty_xdr"], ["not xdr", "invalid_xdr"], ["AAAA", "malformed_header"], ["A".repeat(MAX_XDR_LENGTH + 1), "too_large"]
  ] as const)("maps %s to %s with actionable copy", (raw, code) => {
    expect(runLedgerHeaderDecoder(raw)).toEqual({ ok: false, code });
    expect(errorCopy[code].description.length).toBeGreaterThan(20);
  });
});

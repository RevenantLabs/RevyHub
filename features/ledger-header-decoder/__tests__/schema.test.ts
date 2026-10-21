import { describe, expect, it } from "vitest";
import { MAX_XDR_LENGTH, parseLedgerHeaderDecoderInput } from "@/features/ledger-header-decoder/schema";

describe("ledger header input", () => {
  it("rejects empty and whitespace-only input", () => {
    expect(parseLedgerHeaderDecoderInput(" \n ")).toEqual({ ok: false, code: "empty_xdr" });
  });
  it("rejects non-base64 and truncated padding", () => {
    expect(parseLedgerHeaderDecoderInput("<xdr>")).toEqual({ ok: false, code: "invalid_xdr" });
    expect(parseLedgerHeaderDecoderInput("AAAAA")).toEqual({ ok: false, code: "invalid_xdr" });
  });
  it("rejects an S-prefixed secret seed before decoding", () => {
    expect(parseLedgerHeaderDecoderInput("S" + "A".repeat(55))).toEqual({ ok: false, code: "invalid_xdr" });
  });
  it("bounds raw input before removing whitespace", () => {
    expect(parseLedgerHeaderDecoderInput(" ".repeat(MAX_XDR_LENGTH + 1))).toEqual({ ok: false, code: "too_large" });
  });
  it("accepts the exact boundary and strips wrapping whitespace", () => {
    expect(parseLedgerHeaderDecoderInput("AAAA".repeat(MAX_XDR_LENGTH / 4))).toEqual({ ok: true, value: { xdr: "AAAA".repeat(MAX_XDR_LENGTH / 4) } });
    expect(parseLedgerHeaderDecoderInput(" AA AA\n")).toEqual({ ok: true, value: { xdr: "AAAA" } });
  });
});

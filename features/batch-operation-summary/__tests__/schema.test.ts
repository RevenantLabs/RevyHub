import { describe, expect, it } from "vitest";
import { MAX_ENVELOPE_CHARACTERS, parseBatchOperationSummaryInput } from "@/features/batch-operation-summary/schema";
describe("parseBatchOperationSummaryInput", () => {
  it("rejects empty input", () => expect(parseBatchOperationSummaryInput("   ")).toEqual({ ok: false, code: "empty_xdr" }));
  it("rejects oversized input before decode", () => expect(parseBatchOperationSummaryInput("A".repeat(MAX_ENVELOPE_CHARACTERS + 1))).toEqual({ ok: false, code: "too_large" }));
  it("normalizes valid base64", () => expect(parseBatchOperationSummaryInput("  AAAA  ")).toEqual({ ok: true, value: { envelope: "AAAA" } }));
});

import { describe, expect, it } from "vitest";
import { parseAuditorInput } from "@/features/transaction-sequence-gap-auditor/schema";
import { accountId } from "@/features/transaction-sequence-gap-auditor/fixtures/normal.fixture";

describe("parseAuditorInput", () => {
  it("rejects empty input and secret seeds", () => {
    expect(parseAuditorInput({ accountId: "   " })).toEqual({ ok: false, code: "invalid_input" });
    expect(parseAuditorInput({ accountId: `S${"A".repeat(55)}` })).toEqual({
      ok: false,
      code: "invalid_input"
    });
  });

  it("rejects muxed and contract variants", () => {
    expect(parseAuditorInput({ accountId: `M${"A".repeat(68)}` }).ok).toBe(false);
    expect(parseAuditorInput({ accountId: `C${"A".repeat(55)}` })).toEqual({
      ok: false,
      code: "unsupported_variant"
    });
  });

  it("rejects malformed input", () => {
    expect(parseAuditorInput({ accountId: "not an address" })).toEqual({
      ok: false,
      code: "invalid_input"
    });
    expect(parseAuditorInput({ accountId: `G${"A".repeat(55)}` })).toEqual({
      ok: false,
      code: "invalid_input"
    });
  });

  it("trims a valid public G-address", () => {
    expect(parseAuditorInput({ accountId: `  ${accountId}  ` })).toEqual({
      ok: true,
      value: { accountId }
    });
  });
});

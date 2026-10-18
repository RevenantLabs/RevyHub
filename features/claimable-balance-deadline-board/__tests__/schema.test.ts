import { describe, expect, it } from "vitest";
import { parseDeadlineBoardInput } from "../schema";
import { claimant } from "../fixtures/claimableBalanceDeadlineBoard.fixture";
describe("input validation", () => {
  it("accepts public claimant and numeric Horizon cursor", () => expect(parseDeadlineBoardInput({ claimant, cursor: "1234567890" })).toEqual({ ok: true, value: { claimant, cursor: "1234567890" } }));
  it("rejects empty and malformed claimant", () => {
    expect(parseDeadlineBoardInput({ claimant: "" })).toEqual({ ok: false, code: "invalid_claimant" });
    expect(parseDeadlineBoardInput({ claimant: "Gbad" })).toEqual({ ok: false, code: "invalid_claimant" });
  });
  it("rejects secret keys by prefix without returning them", () => {
    const result = parseDeadlineBoardInput({ claimant: "S" + "x".repeat(55) });
    expect(result).toEqual({ ok: false, code: "invalid_claimant" });
    expect(JSON.stringify(result)).not.toContain("Sxxx");
  });
  it("rejects cursors with URL syntax", () => expect(parseDeadlineBoardInput({ claimant, cursor: "x&claimant=other" })).toEqual({ ok: false, code: "invalid_cursor" }));
  it("rejects nonnumeric cursors, including secret keys", () => {
    expect(parseDeadlineBoardInput({ claimant, cursor: "abc_123" })).toEqual({ ok: false, code: "invalid_cursor" });
    expect(parseDeadlineBoardInput({ claimant, cursor: "S" + "x".repeat(55) })).toEqual({ ok: false, code: "invalid_cursor" });
  });
});

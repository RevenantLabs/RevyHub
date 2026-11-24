import { describe, expect, it } from "vitest";
import { parseInput, MAX_JSON_LENGTH } from "@/features/claimable-predicate-evaluator/schema";
import { claimantA, balanceJson, deadline } from "@/features/claimable-predicate-evaluator/fixtures/normal.fixture";
const raw = { source: "balance_json" as const, text: balanceJson, claimant: claimantA, evaluationTime: deadline, creationTime: "" };
describe("input schema", () => {
  it("accepts explicit whole-second UTC time", () => { const r = parseInput(raw); expect(r.ok && r.value.evaluationSeconds).toBe(1795435200n); });
  it("rejects local, subsecond, impossible, and reverse times", () => {
    for (const time of ["2026-11-23T12:00:00", "2026-11-23T12:00:00.500Z", "2026-02-30T12:00:00Z", "1969-12-31T23:59:59Z"]) expect(parseInput({ ...raw, evaluationTime: time })).toEqual({ ok: false, code: "invalid_input" });
    expect(parseInput({ ...raw, creationTime: "2026-11-24T12:00:00Z" })).toEqual({ ok: false, code: "invalid_input" });
  });
  it("rejects secret seeds, invalid addresses, and oversize input", () => {
    expect(parseInput({ ...raw, claimant: "S" + "A".repeat(55) }).ok).toBe(false);
    expect(parseInput({ ...raw, claimant: "bad" }).ok).toBe(false);
    expect(parseInput({ ...raw, text: "a".repeat(MAX_JSON_LENGTH + 1) })).toEqual({ ok: false, code: "too_large" });
  });
  it("rejects invalid base64 before decoding", () => expect(parseInput({ ...raw, source: "predicate_xdr", text: "%%%" })).toEqual({ ok: false, code: "malformed_data" }));
  it("rejects an unsupported source and pasted seed prefix", () => {
    expect(parseInput({ ...raw, source: "other" as typeof raw.source })).toEqual({ ok: false, code: "invalid_input" });
    expect(parseInput({ ...raw, text: '"SABC"' })).toEqual({ ok: false, code: "invalid_input" });
  });
});

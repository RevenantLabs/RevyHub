import { describe, expect, it } from "vitest";
import { deadlineFor, parsePredicate } from "../lib/deadline-parser";
import { nestedBalance } from "../fixtures/nested-deadlines.fixture";
describe("deadline parser", () => {
  it("uses an absolute before instant as a deadline", () => {
    const parsed = parsePredicate({ abs_before: "2026-10-01T00:00:00Z", abs_before_epoch: "1790812800" });
    expect(parsed.ok && deadlineFor(parsed.value)).toEqual({ deadline: "2026-10-01T00:00:00.000Z", kind: "absolute" });
  });
  it("derives relative before only with explicit creation context", () => {
    const missing = parsePredicate({ rel_before: "60" });
    const known = parsePredicate({ rel_before: "60" }, "2026-09-01T00:00:00Z");
    expect(missing.ok && deadlineFor(missing.value)).toBeUndefined();
    expect(known.ok && deadlineFor(known.value)).toEqual({ deadline: "2026-09-01T00:01:00.000Z", kind: "relative" });
  });
  it("preserves nested and/or/not shape without inventing a single expiry", () => {
    const parsed = parsePredicate(nestedBalance.claimants[0].predicate);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.kind).toBe("or");
    expect(deadlineFor(parsed.value)).toBeUndefined();
    expect(JSON.stringify(parsed.value)).toContain('"kind":"not"');
  });
  it("rejects empty operators, unknown leaves and excessive depth", () => {
    expect(parsePredicate({ and: [] })).toEqual({ ok: false, code: "malformed_predicate" });
    expect(parsePredicate({ mystery: true })).toEqual({ ok: false, code: "malformed_predicate" });
    expect(parsePredicate({ unconditional: true, abs_before_epoch: "1" })).toEqual({ ok: false, code: "malformed_predicate" });
    expect(parsePredicate({ abs_before: "2026-10-01T00:00:00Z", abs_before_epoch: "1" })).toEqual({ ok: false, code: "malformed_predicate" });
    expect(parsePredicate({ abs_before: "2026-10-01T00:00:00" })).toEqual({ ok: false, code: "malformed_predicate" });
    expect(parsePredicate({ abs_before: "2026-02-30T00:00:00Z" })).toEqual({ ok: false, code: "malformed_predicate" });
    let value: unknown = { unconditional: true };
    for (let i = 0; i < 18; i++) value = { not: value };
    expect(parsePredicate(value)).toEqual({ ok: false, code: "malformed_predicate" });
  });
});

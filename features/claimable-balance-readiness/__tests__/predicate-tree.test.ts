import { describe, expect, it } from "vitest";
import {
  describeNormalizedPredicate,
  normalizePredicate
} from "@/features/claimable-balance-readiness/lib/predicate-tree";
import {
  absAfterPredicate,
  absBeforePredicate,
  andBothAbsPredicate,
  emptyObjectPredicate,
  nestedOrAndNotPredicate,
  relAfterPredicate,
  relBeforePredicate,
  unconditionalPredicate,
  unsupportedPredicate
} from "@/features/claimable-balance-readiness/fixtures/predicates.fixture";

describe("normalizePredicate", () => {
  it("treats unconditional and empty objects as unconditional", () => {
    expect(normalizePredicate(unconditionalPredicate)).toEqual({
      ok: true,
      value: { kind: "unconditional" }
    });
    expect(normalizePredicate(emptyObjectPredicate)).toEqual({
      ok: true,
      value: { kind: "unconditional" }
    });
  });

  it("normalizes absolute and relative leaves", () => {
    expect(normalizePredicate(absBeforePredicate).ok && normalizePredicate(absBeforePredicate)).toMatchObject({
      ok: true,
      value: { kind: "abs_before", boundMs: 1798761600_000 }
    });
    expect(normalizePredicate(absAfterPredicate)).toMatchObject({
      ok: true,
      value: { kind: "abs_after", boundMs: 1767225600_000 }
    });
    expect(normalizePredicate(relBeforePredicate)).toEqual({
      ok: true,
      value: { kind: "rel_before", seconds: 86400 }
    });
    expect(normalizePredicate(relAfterPredicate)).toEqual({
      ok: true,
      value: { kind: "rel_after", seconds: 3600 }
    });
  });

  it("normalizes nested and/or/not at least three levels deep", () => {
    const result = normalizePredicate(nestedOrAndNotPredicate);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("or");
    expect(describeNormalizedPredicate(result.value)).toBe(
      "not (before 2027-01-01 00:00:00 UTC) and within 2 minutes after the balance was created or from 2026-01-01 00:00:00 UTC onward"
    );
  });

  it("rejects unsupported shapes", () => {
    expect(normalizePredicate(unsupportedPredicate)).toEqual({
      ok: false,
      code: "unsupported_predicate"
    });
  });

  it("normalizes a simple AND of absolute bounds", () => {
    const result = normalizePredicate(andBothAbsPredicate);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("and");
  });
});

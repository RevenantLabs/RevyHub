import { describe, expect, it } from "vitest";
import { evaluatePredicate, outcomeToVerdict } from "@/features/claimable-balance-readiness/lib/claim-evaluator";
import { normalizePredicate } from "@/features/claimable-balance-readiness/lib/predicate-tree";
import type { EvaluationTimeContext } from "@/features/claimable-balance-readiness/lib/time-context";
import {
  andBothAbsPredicate,
  nestedOrAndNotPredicate,
  unconditionalPredicate
} from "@/features/claimable-balance-readiness/fixtures/predicates.fixture";
import {
  creationIso,
  creationMs,
  evaluationAfterTwoHours,
  evaluationInsideHour,
  relAfterOneHour,
  relBeforeOneHour
} from "@/features/claimable-balance-readiness/fixtures/relative-time.fixture";

function reliableContext(evaluationIso: string): EvaluationTimeContext {
  return {
    evaluationMs: Date.parse(evaluationIso),
    evaluationIso,
    creationMs,
    creationIso,
    creationReliable: true,
    creationSource: "last_modified_time"
  };
}

function unreliableContext(evaluationIso: string): EvaluationTimeContext {
  return {
    evaluationMs: Date.parse(evaluationIso),
    evaluationIso,
    creationMs: null,
    creationIso: null,
    creationReliable: false,
    creationSource: "unavailable"
  };
}

describe("evaluatePredicate", () => {
  it("marks unconditional predicates as satisfied", () => {
    const normalized = normalizePredicate(unconditionalPredicate);
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    const tree = evaluatePredicate(normalized.value, reliableContext("2026-06-01T12:00:00Z"));
    expect(tree.outcome).toBe("satisfied");
    expect(outcomeToVerdict(tree.outcome)).toBe("eligible");
  });

  it("evaluates absolute AND windows", () => {
    const normalized = normalizePredicate(andBothAbsPredicate);
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;

    const inside = evaluatePredicate(normalized.value, reliableContext("2026-06-01T12:00:00Z"));
    expect(inside.outcome).toBe("satisfied");

    const before = evaluatePredicate(normalized.value, reliableContext("2025-06-01T12:00:00Z"));
    expect(before.outcome).toBe("unsatisfied");
  });

  it("evaluates relative before/after against creation context", () => {
    const before = normalizePredicate(relBeforeOneHour);
    const after = normalizePredicate(relAfterOneHour);
    expect(before.ok && after.ok).toBe(true);
    if (!before.ok || !after.ok) return;

    expect(
      evaluatePredicate(before.value, reliableContext(evaluationInsideHour)).outcome
    ).toBe("satisfied");
    expect(
      evaluatePredicate(before.value, reliableContext(evaluationAfterTwoHours)).outcome
    ).toBe("unsatisfied");
    expect(
      evaluatePredicate(after.value, reliableContext(evaluationInsideHour)).outcome
    ).toBe("unsatisfied");
    expect(
      evaluatePredicate(after.value, reliableContext(evaluationAfterTwoHours)).outcome
    ).toBe("satisfied");
  });

  it("returns indeterminate for relative predicates without creation context", () => {
    const after = normalizePredicate(relAfterOneHour);
    expect(after.ok).toBe(true);
    if (!after.ok) return;

    const tree = evaluatePredicate(after.value, unreliableContext(evaluationInsideHour));
    expect(tree.outcome).toBe("indeterminate");
    expect(outcomeToVerdict(tree.outcome)).toBe("indeterminate");
  });

  it("evaluates nested or/and/not trees", () => {
    const normalized = normalizePredicate(nestedOrAndNotPredicate);
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;

    // Outer OR has abs_after 2026-01-01 which is satisfied in June 2026.
    const tree = evaluatePredicate(normalized.value, reliableContext("2026-06-01T12:00:00Z"));
    expect(tree.outcome).toBe("satisfied");
    expect(tree.children).toHaveLength(2);
  });
});

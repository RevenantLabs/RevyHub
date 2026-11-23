import { describe, expect, it } from "vitest";
import { evaluatePredicate } from "@/features/claimable-predicate-evaluator/lib/time-evaluation";
const deadline = 100n;
const context = (evaluationSeconds: bigint, creationSeconds: bigint | null = null) => ({ evaluationSeconds, creationSeconds });
describe("strict predicate time boundaries", () => {
  it("absolute before is true only before the deadline", () => {
    const p = { kind: "abs_before" as const, seconds: deadline };
    expect([99n, 100n, 101n].map((t) => evaluatePredicate(p, context(t)).verdict)).toEqual(["true", "false", "false"]);
    expect([99n, 100n, 101n].map((t) => evaluatePredicate({ kind: "not", child: p }, context(t)).verdict)).toEqual(["false", "true", "true"]);
  });
  it("relative before uses creation plus duration and is unknown without creation", () => {
    const p = { kind: "rel_before" as const, seconds: 60n };
    expect([99n, 100n, 101n].map((t) => evaluatePredicate(p, context(t, 40n)).verdict)).toEqual(["true", "false", "false"]);
    expect([99n, 100n, 101n].map((t) => evaluatePredicate({ kind: "not", child: p }, context(t, 40n)).verdict)).toEqual(["false", "true", "true"]);
    expect(evaluatePredicate(p, context(99n)).verdict).toBe("unknown");
    expect(evaluatePredicate({ kind: "not", child: p }, context(99n)).verdict).toBe("unknown");
  });
  it("three-valued AND/OR preserve decisive branches", () => {
    const unknown = { kind: "rel_before" as const, seconds: 60n };
    const yes = { kind: "unconditional" as const };
    const no = { kind: "not" as const, child: yes };
    expect(evaluatePredicate({ kind: "and", children: [unknown, no] }, context(1n)).verdict).toBe("false");
    expect(evaluatePredicate({ kind: "or", children: [unknown, yes] }, context(1n)).verdict).toBe("true");
    expect(evaluatePredicate({ kind: "and", children: [unknown, yes] }, context(1n)).verdict).toBe("unknown");
  });
});

import { describe, expect, it, vi } from "vitest";
import { parseInput, type RawInput } from "@/features/claimable-predicate-evaluator/schema";
import { runClaimablePredicateEvaluator } from "@/features/claimable-predicate-evaluator/lib/claimablePredicateEvaluator";
import { claimantA, claimantB, balanceJson, predicateXdr, before, deadline, after } from "@/features/claimable-predicate-evaluator/fixtures/normal.fixture";
import { relativeBalance, creationTime, malformedUnion } from "@/features/claimable-predicate-evaluator/fixtures/boundary.fixture";
const raw: RawInput = { source: "balance_json", text: balanceJson, claimant: claimantA, evaluationTime: deadline, creationTime: "" };
function run(input: RawInput) { const parsed = parseInput(input); if (!parsed.ok) return parsed; return runClaimablePredicateEvaluator(parsed.value); }
describe("offline claimable predicate evaluator", () => {
  it("evaluates different claimants on the same balance without requests", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(run({ ...raw, claimant: claimantA, evaluationTime: before })).toMatchObject({ ok: true, value: { verdict: "false", amount: "922337203685.4775807" } });
    expect(run({ ...raw, claimant: claimantA, evaluationTime: deadline })).toMatchObject({ ok: true, value: { verdict: "true" } });
    expect(run({ ...raw, claimant: claimantB, evaluationTime: after })).toMatchObject({ ok: true, value: { verdict: "true" } });
    expect(fetchSpy).not.toHaveBeenCalled(); fetchSpy.mockRestore();
  });
  it("supports predicate XDR with explicit claimant context", () => expect(run({ ...raw, source: "predicate_xdr", text: predicateXdr })).toMatchObject({ ok: true, value: { verdict: "true", source: "predicate_xdr", balanceId: null } }));
  it("leaves relative and absent claimant evidence unknown", () => {
    expect(run({ ...raw, text: relativeBalance })).toMatchObject({ ok: true, value: { verdict: "unknown", evidence: "incomplete", limitation: "missing_creation" } });
    expect(run({ ...raw, text: relativeBalance, creationTime })).toMatchObject({ ok: true, value: { verdict: "false", evidence: "complete" } });
    expect(run({ ...raw, claimant: "G" + "A".repeat(55) }).ok).toBe(false);
    expect(run({ ...raw, text: JSON.stringify({ claimants: [{ destination: claimantB, predicate: { unconditional: true } }] }) })).toMatchObject({ ok: true, value: { verdict: "unknown", limitation: "claimant_not_listed" } });
    const decisiveOr = JSON.stringify({ claimants: [{ destination: claimantA, predicate: { or: [{ unconditional: true }, { rel_before: "60" }] } }] });
    expect(run({ ...raw, text: decisiveOr })).toMatchObject({ ok: true, value: { verdict: "unknown", tree: { verdict: "true" }, evidence: "incomplete" } });
  });
  it("rejects malformed unions", () => expect(run({ ...raw, text: malformedUnion })).toEqual({ ok: false, code: "malformed_data" }));
  it("rejects unsupported arms, invalid asset metadata, and too many claimants", () => {
    expect(run({ ...raw, text: JSON.stringify({ claimants: [{ destination: claimantA, predicate: { after: "1" } }] }) })).toEqual({ ok: false, code: "unsupported_variant" });
    expect(run({ ...raw, text: JSON.stringify({ asset: `USD:${claimantA.slice(0, -1)}A`, claimants: [{ destination: claimantA, predicate: { unconditional: true } }] }) })).toEqual({ ok: false, code: "malformed_data" });
    expect(run({ ...raw, text: JSON.stringify({ amount: "922337203685.4775808", claimants: [{ destination: claimantA, predicate: { unconditional: true } }] }) })).toEqual({ ok: false, code: "malformed_data" });
    expect(run({ ...raw, text: JSON.stringify({ id: "a".repeat(64), claimants: [{ destination: claimantA, predicate: { unconditional: true } }] }) })).toEqual({ ok: false, code: "malformed_data" });
    expect(run({ ...raw, text: JSON.stringify({ claimants: Array.from({ length: 11 }, () => ({ destination: claimantA, predicate: { unconditional: true } })) }) })).toEqual({ ok: false, code: "too_large" });
  });
});

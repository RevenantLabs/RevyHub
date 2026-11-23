import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useClaimablePredicateEvaluator } from "@/features/claimable-predicate-evaluator/hooks/useClaimablePredicateEvaluator";
import { claimantA, balanceJson, deadline } from "@/features/claimable-predicate-evaluator/fixtures/normal.fixture";
import { relativeBalance } from "@/features/claimable-predicate-evaluator/fixtures/boundary.fixture";
const raw = { source: "balance_json" as const, text: balanceJson, claimant: claimantA, evaluationTime: deadline, creationTime: "" };
describe("evaluator state", () => {
  it("moves through loading, success, incomplete, error and reset", async () => {
    const { result } = renderHook(() => useClaimablePredicateEvaluator());
    expect(result.current.state.status).toBe("idle");
    let pending: Promise<void>;
    act(() => { pending = result.current.submit(raw); });
    expect(result.current.state.status).toBe("loading");
    await act(async () => { await pending!; });
    expect(result.current.state.status).toBe("success");
    await act(async () => { await result.current.submit({ ...raw, text: relativeBalance }); });
    expect(result.current.state.status).toBe("incomplete");
    await act(async () => { await result.current.submit({ ...raw, claimant: "bad" }); });
    expect(result.current.state.status).toBe("error");
    act(() => result.current.reset()); expect(result.current.state.status).toBe("idle");
  });
  it("drops a stale local result after reset or replacement", async () => {
    const { result } = renderHook(() => useClaimablePredicateEvaluator());
    let first: Promise<void>;
    act(() => { first = result.current.submit(raw); result.current.reset(); });
    await act(async () => { await first!; });
    expect(result.current.state.status).toBe("idle");
    act(() => { first = result.current.submit(raw); });
    await act(async () => { await result.current.submit({ ...raw, claimant: "bad" }); await first!; });
    expect(result.current.state.status).toBe("error");
  });
});

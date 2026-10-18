import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { runClaimableBalanceDeadlineBoard } from "../lib/claimableBalanceDeadlineBoard";
import { claimant } from "../fixtures/claimableBalanceDeadlineBoard.fixture";
import { handlers } from "../msw/handlers";
import { errorCopy } from "../copy";
withMswHandlers(...handlers);
describe("deadline board", () => {
  it("separates absolute and unknown relative deadlines", async () => {
    const result = await runClaimableBalanceDeadlineBoard({ claimant }, "testnet", undefined, Date.parse("2026-09-28T00:00:00Z"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.pagesFetched).toBe(1);
    expect(result.value.nextCursor).toBe("101");
    expect(result.value.dated).toHaveLength(1);
    expect(result.value.dated[0].conditionPassed).toBe(false);
    expect(result.value.undated).toHaveLength(1);
    expect(result.value.undated[0].deadline).toBeUndefined();
  });
  it("a passed condition remains a current listed balance", async () => {
    const result = await runClaimableBalanceDeadlineBoard({ claimant }, "testnet", undefined, Date.parse("2026-11-01T00:00:00Z"));
    expect(result.ok && result.value.dated[0].conditionPassed).toBe(true);
  });
  it("keeps compound predicates undated", async () => {
    const result = await runClaimableBalanceDeadlineBoard({ claimant, cursor: "301" }, "testnet");
    expect(result.ok && result.value.undated[0].predicate.kind).toBe("or");
  });
  it.each([
    ["302", "malformed_predicate"], ["304", "history_unavailable"],
    ["303", "rate_limited"], ["305", "invalid_cursor"], ["306", "request_failed"]
  ])("maps %s response to %s", async (cursor, code) => {
    expect(await runClaimableBalanceDeadlineBoard({ claimant, cursor }, "testnet")).toEqual({ ok: false, code });
  });
  it("provides specific recovery advice for every error code", () => {
    for (const code of ["invalid_claimant", "invalid_cursor", "malformed_predicate", "history_unavailable", "rate_limited", "request_failed"] as const) {
      expect(errorCopy[code].title.length).toBeGreaterThan(5);
      expect(errorCopy[code].description.length).toBeGreaterThan(20);
    }
  });
  it("shows an empty current list without inferring claim history", async () => {
    const result = await runClaimableBalanceDeadlineBoard({ claimant: "G" + "x".repeat(55) }, "testnet");
    expect(result.ok && result.value.dated).toEqual([]);
    expect(result.ok && result.value.undated).toEqual([]);
  });
});

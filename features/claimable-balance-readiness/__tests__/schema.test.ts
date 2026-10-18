import { describe, expect, it } from "vitest";
import { parseClaimableBalanceReadinessInput } from "@/features/claimable-balance-readiness/schema";
import {
  balanceId,
  claimantAccount,
  evaluationTime
} from "@/features/claimable-balance-readiness/fixtures/claimableBalanceReadiness.fixture";

describe("parseClaimableBalanceReadinessInput", () => {
  it("rejects an invalid balance ID", () => {
    const result = parseClaimableBalanceReadinessInput({
      balanceId: "abc",
      claimant: claimantAccount,
      evaluationTime
    });
    expect(result).toEqual({ ok: false, code: "invalid_balance_id" });
  });

  it("rejects an empty balance ID", () => {
    const result = parseClaimableBalanceReadinessInput({
      balanceId: "   ",
      claimant: claimantAccount,
      evaluationTime
    });
    expect(result).toEqual({ ok: false, code: "invalid_balance_id" });
  });

  it("rejects an invalid claimant address", () => {
    const result = parseClaimableBalanceReadinessInput({
      balanceId,
      claimant: "not-an-account",
      evaluationTime
    });
    expect(result).toEqual({ ok: false, code: "invalid_claimant" });
  });

  it("rejects secret keys as claimants", () => {
    const result = parseClaimableBalanceReadinessInput({
      balanceId,
      claimant: "S" + "A".repeat(55),
      evaluationTime
    });
    expect(result).toEqual({ ok: false, code: "invalid_claimant" });
  });

  it("rejects a local-only evaluation time without a timezone", () => {
    const result = parseClaimableBalanceReadinessInput({
      balanceId,
      claimant: claimantAccount,
      evaluationTime: "2026-06-01T12:00:00"
    });
    expect(result).toEqual({ ok: false, code: "invalid_time" });
  });

  it("rejects garbage evaluation times", () => {
    const result = parseClaimableBalanceReadinessInput({
      balanceId,
      claimant: claimantAccount,
      evaluationTime: "tomorrow"
    });
    expect(result).toEqual({ ok: false, code: "invalid_time" });
  });

  it("accepts a valid request and lowercases the balance ID", () => {
    const result = parseClaimableBalanceReadinessInput({
      balanceId: balanceId.toUpperCase(),
      claimant: claimantAccount,
      evaluationTime
    });
    expect(result).toEqual({
      ok: true,
      value: { balanceId, claimant: claimantAccount, evaluationTime }
    });
  });
});

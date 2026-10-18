import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  evaluateBalanceReadiness,
  parseAsset,
  runClaimableBalanceReadiness
} from "@/features/claimable-balance-readiness/lib/claimableBalanceReadiness";
import { handlers } from "@/features/claimable-balance-readiness/msw/handlers";
import {
  balanceId,
  claimantAccount,
  evaluationTime,
  missingBalanceId,
  nestedPredicateBalance,
  noCreationBalanceId,
  noCreationContextBalance,
  outsiderAccount,
  otherClaimant,
  unsupportedBalanceId
} from "@/features/claimable-balance-readiness/fixtures/claimableBalanceReadiness.fixture";
import { errorCopy } from "@/features/claimable-balance-readiness/copy";

withMswHandlers(...handlers);

describe("parseAsset", () => {
  it("labels native assets", () => {
    expect(parseAsset("native")).toEqual({ kind: "native", label: "XLM (native)" });
  });

  it("splits issued assets on the colon", () => {
    const parsed = parseAsset("USDC:GABC");
    expect(parsed).toMatchObject({ kind: "credit", assetCode: "USDC", assetIssuer: "GABC" });
  });
});

describe("evaluateBalanceReadiness", () => {
  it("marks an unconditional selected claimant as eligible", () => {
    const result = evaluateBalanceReadiness(nestedPredicateBalance, {
      balanceId,
      claimant: claimantAccount,
      evaluationTime
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.selectedVerdict).toBe("eligible");
    expect(result.value.selectedTree?.kind).toBe("unconditional");
  });

  it("separates an ineligible outsider from a missing balance", () => {
    const result = evaluateBalanceReadiness(nestedPredicateBalance, {
      balanceId,
      claimant: outsiderAccount,
      evaluationTime
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.selectedVerdict).toBe("not_listed");
    expect(result.value.claimants).toHaveLength(2);
  });

  it("evaluates the nested other claimant as eligible via abs_after", () => {
    const result = evaluateBalanceReadiness(nestedPredicateBalance, {
      balanceId,
      claimant: otherClaimant,
      evaluationTime
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.selectedVerdict).toBe("eligible");
  });

  it("returns indeterminate when relative predicates lack creation context", () => {
    const result = evaluateBalanceReadiness(noCreationContextBalance, {
      balanceId: noCreationBalanceId,
      claimant: claimantAccount,
      evaluationTime
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.selectedVerdict).toBe("indeterminate");
    expect(result.value.timeContext.creationReliable).toBe(false);
  });
});

describe("runClaimableBalanceReadiness", () => {
  it("loads and evaluates a balance by ID", async () => {
    resetHorizonClients();
    const result = await runClaimableBalanceReadiness(
      { balanceId, claimant: claimantAccount, evaluationTime },
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.amount).toBe("125.5000000");
    expect(result.value.selectedVerdict).toBe("eligible");
  });

  it("maps a missing balance ID to balance_not_found", async () => {
    resetHorizonClients();
    const result = await runClaimableBalanceReadiness(
      { balanceId: missingBalanceId, claimant: claimantAccount, evaluationTime },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "balance_not_found" });
    expect(errorCopy.balance_not_found.title).toMatch(/No claimable balance/);
  });

  it("maps unsupported selected predicates to unsupported_predicate", async () => {
    resetHorizonClients();
    const result = await runClaimableBalanceReadiness(
      { balanceId: unsupportedBalanceId, claimant: claimantAccount, evaluationTime },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "unsupported_predicate" });
    expect(errorCopy.unsupported_predicate.description.length).toBeGreaterThan(20);
  });

  it("returns indeterminate for relative balances without creation time", async () => {
    resetHorizonClients();
    const result = await runClaimableBalanceReadiness(
      { balanceId: noCreationBalanceId, claimant: claimantAccount, evaluationTime },
      "testnet"
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.selectedVerdict).toBe("indeterminate");
  });
});

describe("error copy coverage", () => {
  it("provides actionable copy for every error code", () => {
    for (const code of [
      "invalid_balance_id",
      "invalid_claimant",
      "invalid_time",
      "balance_not_found",
      "unsupported_predicate",
      "request_failed"
    ] as const) {
      expect(errorCopy[code].title.length).toBeGreaterThan(5);
      expect(errorCopy[code].description.length).toBeGreaterThan(10);
    }
  });
});

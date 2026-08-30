import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  normalizeClaimableBalance,
  parseAsset,
  runClaimableBalances,
  translateClaimant
} from "@/features/claimable-balances/lib/claimableBalances";
import {
  describePredicate,
  isPredicateClaimableNow
} from "@/features/claimable-balances/lib/predicate";
import { handlers } from "@/features/claimable-balances/msw/handlers";
import {
  balanceId,
  claimantAccount,
  missingBalanceId,
  nestedPredicateBalance,
  otherClaimant
} from "@/features/claimable-balances/fixtures/claimableBalances.fixture";

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

describe("describePredicate", () => {
  it("states unconditional predicates plainly", () => {
    expect(describePredicate({ unconditional: true })).toBe("can be claimed at any time");
    expect(describePredicate({})).toBe("can be claimed at any time");
  });

  it("renders absolute and relative bounds", () => {
    expect(describePredicate({ abs_before: "2026-01-01T00:00:00Z" })).toBe(
      "before 2026-01-01 00:00:00 UTC"
    );
    expect(describePredicate({ abs_after: "2026-01-01T00:00:00Z" })).toBe(
      "from 2026-01-01 00:00:00 UTC onward"
    );
    expect(describePredicate({ rel_before: "86400" })).toBe(
      "within 1 day after the balance was created"
    );
    expect(describePredicate({ rel_after: "3600" })).toBe(
      "at least 1 hour after the balance was created"
    );
  });

  it("renders nested and/or/not combinations at least three levels deep", () => {
    const text = describePredicate({
      or: [
        {
          and: [
            { not: { abs_before: "2027-01-01T00:00:00Z" } },
            { rel_before: "120" }
          ]
        },
        { abs_after: "2026-01-01T00:00:00Z" }
      ]
    });

    expect(text).toBe(
      "not (before 2027-01-01 00:00:00 UTC) and within 2 minutes after the balance was created or from 2026-01-01 00:00:00 UTC onward"
    );
  });
});

describe("isPredicateClaimableNow", () => {
  const fundedAtMs = Date.parse("2026-05-02T10:14:05Z");

  it("evaluates absolute and relative windows", () => {
    expect(
      isPredicateClaimableNow(
        { abs_before: "2027-01-01T00:00:00Z" },
        { fundedAtMs, nowMs: Date.parse("2026-06-01T00:00:00Z") }
      )
    ).toBe(true);

    expect(
      isPredicateClaimableNow(
        { abs_after: "2026-01-01T00:00:00Z" },
        { fundedAtMs, nowMs: Date.parse("2026-06-01T00:00:00Z") }
      )
    ).toBe(true);

    expect(
      isPredicateClaimableNow(
        { rel_before: "3600" },
        { fundedAtMs, nowMs: fundedAtMs + 30 * 60 * 1000 }
      )
    ).toBe(true);

    expect(
      isPredicateClaimableNow(
        { rel_after: "3600" },
        { fundedAtMs, nowMs: fundedAtMs + 30 * 60 * 1000 }
      )
    ).toBe(false);
  });
});

describe("translateClaimant", () => {
  it("marks unconditional claimants as claimable now", () => {
    const translated = translateClaimant(
      { destination: claimantAccount, predicate: { unconditional: true } },
      "2026-05-02T10:14:05Z",
      Date.parse("2026-06-01T00:00:00Z")
    );

    expect(translated.predicateText).toBe("can be claimed at any time");
    expect(translated.claimableNow).toBe(true);
  });
});

describe("normalizeClaimableBalance", () => {
  it("maps Horizon records onto display summaries", () => {
    const summary = normalizeClaimableBalance(
      nestedPredicateBalance,
      Date.parse("2026-06-01T00:00:00Z")
    );

    expect(summary.id).toBe(balanceId);
    expect(summary.claimants).toHaveLength(2);
    expect(summary.claimants[0].destination).toBe(claimantAccount);
    expect(summary.claimants[1].destination).toBe(otherClaimant);
  });
});

describe("runClaimableBalances", () => {
  it("lists balances for a claimant account", async () => {
    resetHorizonClients();
    const result = await runClaimableBalances(
      { mode: "account", accountId: claimantAccount },
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.balances).toHaveLength(1);
    expect(result.value.balances[0].claimants[0].predicateText).toBe(
      "can be claimed at any time"
    );
  });

  it("returns a single balance by ID", async () => {
    resetHorizonClients();
    const result = await runClaimableBalances({ mode: "balance", balanceId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mode).toBe("balance");
    expect(result.value.balances[0].amount).toBe("125.5000000");
  });

  it("maps a missing balance ID to balance_not_found", async () => {
    resetHorizonClients();
    const result = await runClaimableBalances(
      { mode: "balance", balanceId: missingBalanceId },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "balance_not_found" });
  });

  it("returns an empty list when the claimant has no balances", async () => {
    resetHorizonClients();
    const result = await runClaimableBalances(
      { mode: "account", accountId: otherClaimant },
      "testnet"
    );

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.balances).toEqual([]);
  });
});

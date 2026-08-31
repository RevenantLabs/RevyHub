import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  applyLatestDataSponsorship,
  buildSandwich,
  buildSponsorshipPlan,
  runSponsorshipPlanner
} from "@/features/sponsorship-planner/lib/sponsorshipPlanner";
import {
  handlers,
  ledgerUnavailableHandler,
  networkErrorHandler,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/sponsorship-planner/msw/handlers";
import {
  existingSponsorId,
  newSponsoredAccountId,
  poorSponsorAccountId,
  poorSponsorAccountResponse,
  sponsoredAccountId,
  sponsoredAccountResponse,
  sponsorAccountId,
  sponsorAccountResponse,
  unknownSponsorAccountId
} from "@/features/sponsorship-planner/fixtures/sponsorshipPlanner.fixture";
import type { RawEffect } from "@/features/sponsorship-planner/lib/sponsorshipPlanner";

const server = withMswHandlers(...handlers);

describe("applyLatestDataSponsorship", () => {
  function decide(effects: readonly RawEffect[], names: string[]) {
    const pending = new Set(names);
    const sponsors = new Map<string, string>();
    applyLatestDataSponsorship(effects, pending, sponsors);
    return { pending, sponsors };
  }

  it("takes the newest decision and stops tracking the entry", () => {
    const { pending, sponsors } = decide(
      [
        {
          type: "data_sponsorship_updated",
          paging_token: "2",
          data_name: "active",
          new_sponsor: existingSponsorId
        },
        {
          type: "data_sponsorship_created",
          paging_token: "1",
          data_name: "active",
          sponsor: sponsorAccountId
        }
      ],
      ["active"]
    );

    expect([...sponsors]).toEqual([["active", existingSponsorId]]);
    expect(pending.size).toBe(0);
  });

  it("treats a removal as unsponsored and ignores the older sponsorship", () => {
    const { pending, sponsors } = decide(
      [
        { type: "data_sponsorship_removed", paging_token: "4", data_name: "revoked" },
        {
          type: "data_sponsorship_created",
          paging_token: "3",
          data_name: "revoked",
          sponsor: sponsorAccountId
        }
      ],
      ["revoked"]
    );

    expect(sponsors.size).toBe(0);
    expect(pending.size).toBe(0);
  });

  it("leaves an entry pending when no effect decides it", () => {
    const { pending, sponsors } = decide(
      [{ type: "account_credited", paging_token: "9" }],
      ["undecided"]
    );

    expect(sponsors.size).toBe(0);
    expect([...pending]).toEqual(["undecided"]);
  });
});

describe("buildSponsorshipPlan", () => {
  it("plans unsponsored subentries and leaves sponsored ones untouched", () => {
    const plan = buildSponsorshipPlan({
      baseReserveStroops: "5000000",
      sponsor: sponsorAccountResponse,
      sponsoredAccountId,
      sponsoredAccountExists: true,
      sponsored: sponsoredAccountResponse,
      offers: [{ id: "812345", paging_token: "812345" }],
      claimableBalances: [{ id: "c".repeat(64), paging_token: "1" }],
      dataSponsors: new Map()
    });

    expect(plan.plannedEntries.map((entry) => entry.kind)).toEqual([
      "trustline",
      "signer",
      "data",
      "offer",
      "claimable_balance"
    ]);
    expect(plan.plannedUnits).toBe(5);
    expect(plan.plannedCostStroops).toBe("25000000");
    expect(plan.alreadySponsoredEntries.map((entry) => entry.kind)).toEqual([
      "account",
      "trustline",
      "signer"
    ]);
    expect(plan.sponsoredStillNeedsStroops).toBe("0");
  });

  it("covers only the account entry for a brand-new sponsored account", () => {
    const plan = buildSponsorshipPlan({
      baseReserveStroops: "5000000",
      sponsor: sponsorAccountResponse,
      sponsoredAccountId,
      sponsoredAccountExists: false,
      offers: [],
      claimableBalances: [],
      dataSponsors: new Map()
    });

    expect(plan.sponsoredAccountExists).toBe(false);
    expect(plan.plannedEntries).toEqual([
      {
        id: `account:${sponsoredAccountId}`,
        kind: "account",
        reference: sponsoredAccountId,
        reserveUnits: 2
      }
    ]);
    expect(plan.plannedUnits).toBe(2);
    expect(plan.plannedCostStroops).toBe("10000000");
  });

  it("reports the sponsor's exact shortfall against its resulting minimum", () => {
    const plan = buildSponsorshipPlan({
      baseReserveStroops: "5000000",
      sponsor: poorSponsorAccountResponse,
      sponsoredAccountId,
      sponsoredAccountExists: true,
      sponsored: sponsoredAccountResponse,
      offers: [{ id: "812345", paging_token: "812345" }],
      claimableBalances: [{ id: "c".repeat(64), paging_token: "1" }],
      dataSponsors: new Map()
    });

    expect(plan.sponsorCurrentMinimumStroops).toBe("10000000");
    expect(plan.sponsorResultingMinimumStroops).toBe("35000000");
    expect(plan.sponsorBalanceStroops).toBe("30000000");
    expect(plan.sponsorShortfallStroops).toBe("5000000");
  });

  it("keeps the account entry's two reserve units in the sponsor arithmetic", () => {
    const plan = buildSponsorshipPlan({
      baseReserveStroops: "5000000",
      sponsor: sponsorAccountResponse,
      sponsoredAccountId,
      sponsoredAccountExists: false,
      offers: [],
      claimableBalances: [],
      dataSponsors: new Map()
    });

    expect(plan.sponsorCurrentMinimumStroops).toBe("30000000");
    expect(plan.sponsorResultingMinimumStroops).toBe("40000000");
    expect(plan.sponsorShortfallStroops).toBe("0");
  });
});

describe("buildSandwich", () => {
  it("orders the begin/end sandwich with the planned subentry operations inside", () => {
    const sandwich = buildSandwich(
      [
        { id: "trustline:BTC:x", kind: "trustline", reference: "BTC:x", reserveUnits: 1 },
        { id: "signer:y", kind: "signer", reference: "y", reserveUnits: 1 },
        { id: "data:flag", kind: "data", reference: "flag", reserveUnits: 1 }
      ],
      sponsoredAccountId
    );

    expect(sandwich).toEqual([
      { operation: "begin_sponsoring_future_reserves", source: "sponsor" },
      { operation: "change_trust", source: "sponsor", reference: "BTC:x" },
      { operation: "set_options", source: "sponsor", reference: "y" },
      { operation: "manage_data", source: "sponsor", reference: "flag" },
      { operation: "end_sponsoring_future_reserves", source: "sponsored" }
    ]);
  });

  it("opens with create_account for a new sponsored account", () => {
    const sandwich = buildSandwich(
      [{ id: `account:${sponsoredAccountId}`, kind: "account", reference: sponsoredAccountId, reserveUnits: 2 }],
      sponsoredAccountId
    );

    expect(sandwich.map((step) => step.operation)).toEqual([
      "begin_sponsoring_future_reserves",
      "create_account",
      "end_sponsoring_future_reserves"
    ]);
  });
});

describe("runSponsorshipPlanner", () => {
  it("loads both accounts and itemises the plan for an existing sponsored account", async () => {
    const result = await runSponsorshipPlanner(
      { sponsorAccountId, sponsoredAccountId },
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sponsoredAccountExists).toBe(true);
    expect(result.value.plannedUnits).toBe(5);
    expect(result.value.plannedCostStroops).toBe("25000000");
    expect(result.value.alreadySponsoredEntries).toHaveLength(3);
    expect(result.value.sandwich.at(1)?.operation).toBe("change_trust");
    expect(result.value.sandwich.at(-1)?.operation).toBe("end_sponsoring_future_reserves");
  });

  it("treats a missing sponsored account as a new account, not an error", async () => {
    const result = await runSponsorshipPlanner(
      { sponsorAccountId, sponsoredAccountId: newSponsoredAccountId },
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sponsoredAccountExists).toBe(false);
    expect(result.value.plannedEntries).toHaveLength(1);
    expect(result.value.plannedUnits).toBe(2);
  });

  it("reports a shortfall for a sponsor who cannot cover the plan", async () => {
    const result = await runSponsorshipPlanner(
      { sponsorAccountId: poorSponsorAccountId, sponsoredAccountId },
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sponsorShortfallStroops).toBe("5000000");
  });

  it("maps a missing sponsor to sponsor_not_found", async () => {
    const result = await runSponsorshipPlanner(
      { sponsorAccountId: unknownSponsorAccountId, sponsoredAccountId },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "sponsor_not_found" });
  });

  it("maps an unusable ledger to ledger_unavailable", async () => {
    server.use(ledgerUnavailableHandler);
    const result = await runSponsorshipPlanner(
      { sponsorAccountId, sponsoredAccountId },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "ledger_unavailable" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    const result = await runSponsorshipPlanner(
      { sponsorAccountId, sponsoredAccountId },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps a 5xx response to request_failed", async () => {
    server.use(serverErrorHandler);
    const result = await runSponsorshipPlanner(
      { sponsorAccountId, sponsoredAccountId },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });

  it("maps a transport failure to request_failed", async () => {
    server.use(networkErrorHandler);
    const result = await runSponsorshipPlanner(
      { sponsorAccountId, sponsoredAccountId },
      "testnet"
    );
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});

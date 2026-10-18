import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { runOfferLiabilityHeadroom } from "@/features/offer-liability-headroom/lib/offerLiabilityHeadroom";
import {
  handlers,
  inconsistentHandlerAccount,
  inconsistentHandlerOffers,
  malformedHandler,
  rateLimitedHandler
} from "@/features/offer-liability-headroom/msw/handlers";
import {
  accountId,
  unknownAccountId
} from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";

const server = withMswHandlers(...handlers);

describe("runOfferLiabilityHeadroom", () => {
  it("loads account balances and offers", async () => {
    resetHorizonClients();
    const result = await runOfferLiabilityHeadroom({ accountId }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.offers).toHaveLength(1);
    expect(result.value.liabilities.length).toBeGreaterThan(0);
  });

  it("maps account not found", async () => {
    resetHorizonClients();
    expect(await runOfferLiabilityHeadroom({ accountId: unknownAccountId }, "testnet")).toEqual({
      ok: false,
      code: "account_not_found"
    });
  });

  it("maps malformed offers", async () => {
    server.use(malformedHandler);
    resetHorizonClients();
    expect(await runOfferLiabilityHeadroom({ accountId }, "testnet")).toEqual({
      ok: false,
      code: "malformed_offer"
    });
  });

  it("maps inconsistent snapshots", async () => {
    server.use(inconsistentHandlerAccount, inconsistentHandlerOffers);
    resetHorizonClients();
    expect(await runOfferLiabilityHeadroom({ accountId }, "testnet")).toEqual({
      ok: false,
      code: "inconsistent_snapshot"
    });
  });

  it("maps rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    expect(await runOfferLiabilityHeadroom({ accountId }, "testnet")).toEqual({
      ok: false,
      code: "rate_limited"
    });
  });
});

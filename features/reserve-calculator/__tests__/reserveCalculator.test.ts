import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import {
  amountToStroops,
  calculateReserve,
  runReserveCalculator
} from "@/features/reserve-calculator/lib/reserveCalculator";
import { toReserveCalculatorErrorCode } from "@/features/reserve-calculator/lib/reserveCalculator.errors";
import {
  handlers,
  ledgerServerErrorHandler,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/reserve-calculator/msw/handlers";
import {
  accountId,
  ledgerSequence,
  unknownAccountId
} from "@/features/reserve-calculator/fixtures/reserveCalculator.fixture";

const server = withMswHandlers(...handlers);

describe("toReserveCalculatorErrorCode", () => {
  it("uses request_failed for transport failures and timeouts", () => {
    expect(toReserveCalculatorErrorCode(new TypeError("fetch failed"))).toBe("request_failed");
    expect(toReserveCalculatorErrorCode(new Error("request timeout"))).toBe("request_failed");
  });
});

describe("reserve arithmetic", () => {
  it("converts decimal amounts to stroops without floating-point drift", () => {
    expect(amountToStroops("922337203685.4775807")).toBe(9_223_372_036_854_775_807n);
    expect(amountToStroops("0.0000001")).toBe(1n);
  });

  it("applies base, subentry, and sponsorship reserve factors", () => {
    const result = calculateReserve({
      accountId,
      ledgerSequence,
      baseReserveStroops: "5000000",
      nativeBalance: "12.0000000",
      sellingLiabilities: "1.2500000",
      subentryCount: 3,
      numSponsoring: 2,
      numSponsored: 1
    });

    expect(result.minimumBalance).toBe("3.0000000");
    expect(result.spendableBalance).toBe("7.7500000");
    expect(result.breakdown).toEqual({
      baseAccount: "1.0000000",
      subentries: "1.5000000",
      sponsoring: "1.0000000",
      sponsored: "-0.5000000"
    });
  });

  it("flags an account below minimum and never returns negative spendable XLM", () => {
    const result = calculateReserve({
      accountId,
      ledgerSequence,
      baseReserveStroops: "5000000",
      nativeBalance: "1.0000000",
      sellingLiabilities: "0.2500000",
      subentryCount: 2,
      numSponsoring: 0,
      numSponsored: 0
    });

    expect(result.minimumBalance).toBe("2.0000000");
    expect(result.belowMinimum).toBe(true);
    expect(result.spendableBalance).toBe("0.0000000");
  });
});

describe("runReserveCalculator", () => {
  it("loads the account and base reserve from the latest ledger", async () => {
    resetHorizonClients();
    const result = await runReserveCalculator({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      ledgerSequence,
      baseReserve: "0.5000000",
      minimumBalance: "3.0000000",
      spendableBalance: "7.7500000"
    });
  });

  it("maps a Horizon 404 to account_not_found", async () => {
    resetHorizonClients();
    expect(await runReserveCalculator({ accountId: unknownAccountId }, "testnet")).toEqual({
      ok: false,
      code: "account_not_found"
    });
  });

  it("maps a Horizon 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    expect(await runReserveCalculator({ accountId }, "testnet")).toEqual({
      ok: false,
      code: "rate_limited"
    });
  });

  it("maps an account endpoint 5xx to request_failed", async () => {
    server.use(serverErrorHandler);
    resetHorizonClients();
    expect(await runReserveCalculator({ accountId }, "testnet")).toEqual({
      ok: false,
      code: "request_failed"
    });
  });

  it("maps a latest-ledger failure to request_failed", async () => {
    server.use(ledgerServerErrorHandler);
    resetHorizonClients();
    expect(await runReserveCalculator({ accountId }, "testnet")).toEqual({
      ok: false,
      code: "request_failed"
    });
  });
});

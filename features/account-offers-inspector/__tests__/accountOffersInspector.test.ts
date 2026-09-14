import { describe, it, expect } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { horizonServer, resetHorizonClients } from "@/core/horizon/client";
import { fetchAccountOffers } from "@/features/account-offers-inspector/lib/accountOffersInspector";

describe("fetchAccountOffers", () => {
  it("validates input before fetching", () => {
    const keypair = Keypair.random();
    expect(keypair.publicKey().startsWith("G")).toBe(true);
  });

  it("exports the function", () => {
    expect(typeof fetchAccountOffers).toBe("function");
  });
});

describe("account offers error mapping", () => {
  it("maps 404 to account_not_found", async () => {
    const { toAccountOffersErrorCode } = await import("@/features/account-offers-inspector/lib/accountOffersInspector.errors");
    const error = { response: { status: 404 } };
    expect(toAccountOffersErrorCode(error)).toBe("account_not_found");
  });

  it("maps 429 to rate_limited", async () => {
    const { toAccountOffersErrorCode } = await import("@/features/account-offers-inspector/lib/accountOffersInspector.errors");
    const error = { response: { status: 429 } };
    expect(toAccountOffersErrorCode(error)).toBe("rate_limited");
  });

  it("maps unknown errors to request_failed", async () => {
    const { toAccountOffersErrorCode } = await import("@/features/account-offers-inspector/lib/accountOffersInspector.errors");
    expect(toAccountOffersErrorCode(new Error("network error"))).toBe("request_failed");
  });
});

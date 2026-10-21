import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { fetchIssuerClawbackFlag } from "../lib/issuer-clawback-flag";
import { handlers } from "../msw/handlers";
import { issuerAccountId, rateLimitedAccountId, unknownAccountId } from "../fixtures/clawbackEligibilityChecker.fixture";

withMswHandlers(...handlers);

describe("fetchIssuerClawbackFlag", () => {
  it("reads auth_clawback_enabled from the issuer account", async () => {
    const result = await fetchIssuerClawbackFlag(issuerAccountId, "testnet");
    expect(result).toEqual({ ok: true, value: { authClawbackEnabled: false } });
  });

  it("maps a 404 to issuer_not_found", async () => {
    const result = await fetchIssuerClawbackFlag(unknownAccountId, "testnet");
    expect(result).toEqual({ ok: false, code: "issuer_not_found" });
  });

  it("maps a 429 to rate_limited", async () => {
    const result = await fetchIssuerClawbackFlag(rateLimitedAccountId, "testnet");
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });
});

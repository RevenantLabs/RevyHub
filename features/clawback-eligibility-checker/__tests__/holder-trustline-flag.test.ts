import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { fetchHolderTrustlineFlag } from "../lib/holder-trustline-flag";
import { handlers } from "../msw/handlers";
import {
  assetCode,
  holderAccountId,
  issuerAccountId,
  noTrustlineHolderId,
  unknownAccountId
} from "../fixtures/clawbackEligibilityChecker.fixture";

withMswHandlers(...handlers);

describe("fetchHolderTrustlineFlag", () => {
  it("reads is_clawback_enabled from the matching trustline", async () => {
    const result = await fetchHolderTrustlineFlag(holderAccountId, issuerAccountId, assetCode, "testnet");
    expect(result).toEqual({ ok: true, value: { clawbackEnabled: false } });
  });

  it("returns no_trustline when the holder has no matching balance, as a distinct outcome", async () => {
    const result = await fetchHolderTrustlineFlag(noTrustlineHolderId, issuerAccountId, assetCode, "testnet");
    expect(result).toEqual({ ok: false, code: "no_trustline" });
  });

  it("maps a 404 to holder_not_found", async () => {
    const result = await fetchHolderTrustlineFlag(unknownAccountId, issuerAccountId, assetCode, "testnet");
    expect(result).toEqual({ ok: false, code: "holder_not_found" });
  });

  it("matches the asset code case-insensitively", async () => {
    const result = await fetchHolderTrustlineFlag(holderAccountId, issuerAccountId, assetCode.toLowerCase(), "testnet");
    expect(result.ok).toBe(true);
  });
});

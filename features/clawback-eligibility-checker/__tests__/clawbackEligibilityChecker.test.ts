import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { checkClawbackEligibility } from "../lib/clawbackEligibilityChecker";
import { handlers } from "../msw/handlers";
import { holderAccountId, issuerAccountId, assetCode, unknownAccountId } from "../fixtures/clawbackEligibilityChecker.fixture";
import { eligibleHolderId, eligibleIssuerId, eligibleAssetCode } from "../fixtures/eligible-trustline.fixture";
import { disagreeingHolderId, disagreeingIssuerId, disagreeingAssetCode } from "../fixtures/disagreeing-signals.fixture";

withMswHandlers(...handlers);

describe("checkClawbackEligibility", () => {
  it("reports not_eligible when both signals agree the flag is off", async () => {
    const report = await checkClawbackEligibility(
      { issuerAccountId, holderAccountId, assetCode },
      "testnet"
    );
    expect(report.issuer).toEqual({ ok: true, value: { authClawbackEnabled: false } });
    expect(report.holder).toEqual({ ok: true, value: { clawbackEnabled: false } });
    expect(report.verdict).toEqual({ kind: "not_eligible" });
  });

  it("reports eligible when both signals agree the flag is on", async () => {
    const report = await checkClawbackEligibility(
      { issuerAccountId: eligibleIssuerId, holderAccountId: eligibleHolderId, assetCode: eligibleAssetCode },
      "testnet"
    );
    expect(report.verdict).toEqual({ kind: "eligible" });
  });

  it("reports a disagreement explicitly when the two signals differ", async () => {
    const report = await checkClawbackEligibility(
      { issuerAccountId: disagreeingIssuerId, holderAccountId: disagreeingHolderId, assetCode: disagreeingAssetCode },
      "testnet"
    );
    expect(report.verdict).toEqual({ kind: "disagreement", issuerSaysEnabled: true, holderSaysEnabled: false });
  });

  it("shows both fetch outcomes even when one fails, rather than aborting on the first error", async () => {
    const report = await checkClawbackEligibility(
      { issuerAccountId, holderAccountId: unknownAccountId, assetCode },
      "testnet"
    );
    // The issuer fetch still completed — it was not aborted by the holder failure.
    expect(report.issuer).toEqual({ ok: true, value: { authClawbackEnabled: false } });
    expect(report.holder).toEqual({ ok: false, code: "holder_not_found" });
    expect(report.verdict).toEqual({ kind: "unknown" });
  });
});

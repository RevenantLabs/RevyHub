import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { runMultiAccountAssetExposure } from "../lib/multiAccountAssetExposure";
import { accountA, accountB, issuerA, issuerB } from "../fixtures/multiAccountAssetExposure.fixture";
import { handlers } from "../msw/handlers";
withMswHandlers(...handlers);
describe("feature orchestration", () => {
  it("rejects a seed before any request", async () => {
    expect(await runMultiAccountAssetExposure({ accountIds: ["SNOTASEED", accountA] }, "testnet"))
      .toEqual({ ok: false, code: "invalid_account" });
  });
  it("returns two issuer rows and exact totals beyond Number safe range", async () => {
    const result = await runMultiAccountAssetExposure({ accountIds: [accountA, accountB] }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.matrix).toMatchObject([
      { kind: "native", total: "101" },
      { code: "USD", issuer: issuerA, total: "922337203685.4775808" },
      { code: "USD", issuer: issuerB, total: "2", balances: ["2", null] }
    ]);
  });
});

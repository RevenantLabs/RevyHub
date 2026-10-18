import { describe, expect, it } from "vitest";
import { buildAssetMatrix } from "../lib/asset-matrix";
import { multipleAccounts } from "../fixtures/multiple-accounts.fixture";
import { partialFailureAccounts } from "../fixtures/partial-failure.fixture";
import { issuerA, issuerB } from "../fixtures/multiAccountAssetExposure.fixture";
describe("asset matrix", () => {
  it("separates identical codes by issuer and preserves missing trustlines", () => {
    const rows = buildAssetMatrix(multipleAccounts);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ code: "USD", issuer: issuerA, total: "4", balances: ["1.0000001", "2.9999999", null] });
    expect(rows[1]).toMatchObject({ code: "USD", issuer: issuerB, total: "5", balances: ["5", null, "0"] });
  });
  it("excludes failed accounts from observed totals", () => {
    expect(buildAssetMatrix(partialFailureAccounts)[0]).toMatchObject({
      total: "2", balances: ["1.1", null, "0.9"]
    });
  });
});

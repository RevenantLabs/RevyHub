import { describe, expect, it } from "vitest";
import {
  buildLiabilityRows,
  buildOfferRows
} from "@/features/offer-liability-headroom/lib/liability-audit";
import {
  accountResponse,
  offersResponse,
  unmatchedOffersFixture
} from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";

describe("liability-audit", () => {
  it("builds balance rows with headroom estimates", () => {
    const rows = buildLiabilityRows(accountResponse.balances);
    expect(rows[0]).toMatchObject({
      asset: { key: "native" },
      availableToSellEstimate: "75"
    });
  });

  it("matches offers to selling balance rows", () => {
    const liabilities = buildLiabilityRows(accountResponse.balances);
    const keys = new Set(liabilities.map((row) => row.asset.key));
    const built = buildOfferRows(offersResponse._embedded.records, keys);
    expect(built.malformed).toBe(false);
    expect(built.offers[0]?.matchedBalance).toBe(true);
    expect(built.offers[0]?.price.display).toBe("1/2");
  });

  it("flags unmatched selling assets", () => {
    const liabilities = buildLiabilityRows(accountResponse.balances);
    const keys = new Set(liabilities.map((row) => row.asset.key));
    const built = buildOfferRows(unmatchedOffersFixture._embedded.records, keys);
    expect(built.offers[0]?.matchedBalance).toBe(false);
  });
});

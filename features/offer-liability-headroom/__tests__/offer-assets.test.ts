import { describe, expect, it } from "vitest";
import { normalizeOfferAsset } from "@/features/offer-liability-headroom/lib/offer-assets";
import { issuerId } from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";

describe("normalizeOfferAsset", () => {
  it("normalizes native assets", () => {
    expect(normalizeOfferAsset({ asset_type: "native" })).toEqual({
      kind: "native",
      key: "native",
      label: "XLM (native)"
    });
  });

  it("normalizes credit assets with uppercase codes", () => {
    expect(
      normalizeOfferAsset({
        asset_type: "credit_alphanum4",
        asset_code: "usdc",
        asset_issuer: issuerId
      })
    ).toMatchObject({
      kind: "credit",
      code: "USDC",
      key: `USDC:${issuerId}`
    });
  });

  it("rejects incomplete credit assets", () => {
    expect(
      normalizeOfferAsset({ asset_type: "credit_alphanum4", asset_code: "USDC" })
    ).toBeNull();
  });
});

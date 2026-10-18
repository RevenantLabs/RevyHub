import { describe, expect, it } from "vitest";
import { parseOfferLiabilityHeadroomInput } from "@/features/offer-liability-headroom/schema";
import { accountId } from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";

describe("parseOfferLiabilityHeadroomInput", () => {
  it("accepts a G-address", () => {
    expect(parseOfferLiabilityHeadroomInput(accountId)).toEqual({
      ok: true,
      value: { accountId }
    });
  });

  it("rejects empty, secret keys and malformed addresses", () => {
    expect(parseOfferLiabilityHeadroomInput("")).toEqual({
      ok: false,
      code: "invalid_account"
    });
    expect(parseOfferLiabilityHeadroomInput("SAGH")).toEqual({
      ok: false,
      code: "invalid_account"
    });
    expect(parseOfferLiabilityHeadroomInput("not-an-address")).toEqual({
      ok: false,
      code: "invalid_account"
    });
  });
});

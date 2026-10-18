import { describe, expect, it } from "vitest";
import {
  formatAssetLabel,
  formatNetworkLabel,
  formatOfferLine,
  formatPrice
} from "@/features/offer-liability-headroom/lib/format";

describe("format helpers", () => {
  it("labels networks and assets", () => {
    expect(formatNetworkLabel("testnet")).toBe("Testnet");
    expect(formatAssetLabel({ kind: "native", key: "native", label: "XLM (native)" })).toBe(
      "XLM (native)"
    );
  });

  it("formats exact prices with approximate preview", () => {
    expect(
      formatPrice({
        numerator: "1",
        denominator: "2",
        display: "1/2",
        approximate: "0.5"
      })
    ).toBe("1/2 (≈ 0.5)");
  });

  it("formats offer lines", () => {
    expect(
      formatOfferLine({
        id: "1",
        selling: { kind: "native", key: "native", label: "XLM (native)" },
        buying: {
          kind: "credit",
          key: "USDC:G",
          code: "USDC",
          issuer: "G",
          label: "USDC"
        },
        amount: "25.0000000",
        price: {
          numerator: "1",
          denominator: "2",
          display: "1/2",
          approximate: "0.5"
        },
        lastModifiedLedger: "1",
        matchedBalance: true
      })
    ).toContain("25.0000000");
  });
});

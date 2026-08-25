import { describe, expect, it } from "vitest";
import { buildPaymentUri, parsePaymentUri } from "@/features/payment-qr/lib/paymentUri";
import { destination, issuer } from "@/features/payment-qr/fixtures/paymentQr.fixture";

describe("buildPaymentUri", () => {
  it("builds a native payment request", () => {
    const uri = buildPaymentUri({
      destination,
      amount: "10.5",
      asset: { kind: "native" }
    });

    expect(uri.startsWith("web+stellar:pay?")).toBe(true);
    const params = parsePaymentUri(uri);
    expect(params).toMatchObject({ destination, amount: "10.5" });
    expect(params).not.toHaveProperty("asset_code");
  });

  it("includes the asset code and issuer for an issued asset", () => {
    const uri = buildPaymentUri({
      destination,
      amount: "25",
      asset: { kind: "issued", code: "USDC", issuer }
    });

    expect(parsePaymentUri(uri)).toMatchObject({ asset_code: "USDC", asset_issuer: issuer });
  });

  it("declares memo_type whenever a memo is present", () => {
    const uri = buildPaymentUri({
      destination,
      amount: "1",
      asset: { kind: "native" },
      memo: "Invoice 1001"
    });

    expect(parsePaymentUri(uri)).toMatchObject({
      memo: "Invoice 1001",
      memo_type: "MEMO_TEXT"
    });
  });

  it("omits optional parameters that were not supplied", () => {
    const params = parsePaymentUri(
      buildPaymentUri({ destination, amount: "1", asset: { kind: "native" } })
    );

    expect(params).not.toHaveProperty("memo");
    expect(params).not.toHaveProperty("msg");
  });

  it("produces a byte-identical URI for identical requests", () => {
    const request = {
      destination,
      amount: "1",
      asset: { kind: "issued" as const, code: "USDC", issuer },
      memo: "x",
      msg: "y"
    };

    expect(buildPaymentUri(request)).toBe(buildPaymentUri(request));
  });

  it("round-trips through the parser", () => {
    const uri = buildPaymentUri({
      destination,
      amount: "3.1415926",
      asset: { kind: "native" },
      msg: "Coffee"
    });

    expect(parsePaymentUri(uri)).toMatchObject({ amount: "3.1415926", msg: "Coffee" });
  });
});

describe("parsePaymentUri", () => {
  it("rejects a URI with a different scheme or action", () => {
    expect(parsePaymentUri("https://example.com")).toBeNull();
    expect(parsePaymentUri("web+stellar:tx?xdr=AAA")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { createPaymentUri, validateStellarAmount } from "../../lib/stellar/paymentUri";

describe("createPaymentUri", () => {
  const destination = Keypair.random().publicKey();

  it("creates a payment URI for a valid native XLM request", () => {
    const uri = createPaymentUri({
      destination,
      amount: "10.5",
      asset: "XLM",
      memo: "Invoice 1001"
    });

    expect(uri).toContain("web+stellar:pay?");
    expect(uri).toContain(`destination=${encodeURIComponent(destination)}`);
    expect(uri).toContain("amount=10.5");
    expect(uri).toContain("asset_code=XLM");
    expect(uri).toContain("memo=Invoice+1001");
  });

  it("creates a payment URI for a validated issued asset", () => {
    const issuer = Keypair.random().publicKey();
    const uri = createPaymentUri({
      destination,
      amount: "25",
      asset: "ISSUED",
      assetCode: "usdc",
      assetIssuer: issuer
    });

    expect(uri).toContain("asset_code=USDC");
    expect(uri).toContain(`asset_issuer=${encodeURIComponent(issuer)}`);
  });

  it("rejects issued assets without a valid code or issuer", () => {
    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "ISSUED",
        assetCode: "TOO-LONG-ASSET-CODE",
        assetIssuer: Keypair.random().publicKey()
      })
    ).toThrow(/1 to 12/);

    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "ISSUED",
        assetCode: "USDC",
        assetIssuer: "not-an-issuer"
      })
    ).toThrow(/Asset issuer/);
  });

  it("rejects invalid destination addresses", () => {
    expect(() =>
      createPaymentUri({
        destination: "not-a-stellar-address",
        amount: "10",
        asset: "XLM"
      })
    ).toThrow(/start with G/);
  });

  it("rejects zero amounts", () => {
    expect(() => createPaymentUri({ destination, amount: "0", asset: "XLM" })).toThrow(
      /positive payment amount/
    );
  });

  it("rejects non-numeric amounts", () => {
    expect(() => createPaymentUri({ destination, amount: "ten", asset: "XLM" })).toThrow(
      /decimal number/
    );
  });

  it("rejects memo text longer than Stellar memo text limits", () => {
    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "this memo is intentionally too long"
      })
    ).toThrow(/28 characters or less/);
  });

  it("embeds the canonical amount in the URI, not the raw input", () => {
    // Leading/trailing zeros should be stripped in the URI.
    const uri = createPaymentUri({ destination, amount: "007.50000", asset: "XLM" });
    expect(uri).toContain("amount=7.5");
    expect(uri).not.toContain("amount=007.50000");
  });
});

describe("validateStellarAmount", () => {
  // --- accepted formats ---
  it("accepts a plain integer", () => {
    expect(validateStellarAmount("10")).toBe("10");
  });

  it("accepts a decimal with up to 7 fractional digits", () => {
    expect(validateStellarAmount("10.5")).toBe("10.5");
    expect(validateStellarAmount("1.234567")).toBe("1.234567");
    expect(validateStellarAmount("9.9999999")).toBe("9.9999999");
  });

  it("accepts the smallest valid stroop amount", () => {
    expect(validateStellarAmount("0.0000001")).toBe("0.0000001");
  });

  it("accepts a large integer amount", () => {
    expect(validateStellarAmount("99999999999")).toBe("99999999999");
  });

  // --- canonical output ---
  it("strips leading zeros from the integer part", () => {
    expect(validateStellarAmount("007")).toBe("7");
    expect(validateStellarAmount("007.5")).toBe("7.5");
  });

  it("strips trailing zeros from the fractional part", () => {
    expect(validateStellarAmount("1.5000000")).toBe("1.5");
    expect(validateStellarAmount("1.0000000")).toBe("1");
  });

  it("handles an amount with both leading and trailing zeros", () => {
    expect(validateStellarAmount("007.50000")).toBe("7.5");
  });

  // --- rejection: zero ---
  it("rejects zero", () => {
    expect(() => validateStellarAmount("0")).toThrow(/positive payment amount/);
    expect(() => validateStellarAmount("0.0")).toThrow(/positive payment amount/);
    expect(() => validateStellarAmount("000.0000000")).toThrow(/positive payment amount/);
  });

  // --- rejection: too many fractional digits ---
  it("rejects more than 7 fractional digits", () => {
    expect(() => validateStellarAmount("1.00000001")).toThrow(/7 fractional digits/);
    expect(() => validateStellarAmount("0.00000009")).toThrow(/7 fractional digits/);
  });

  // --- rejection: scientific notation ---
  it("rejects scientific notation", () => {
    expect(() => validateStellarAmount("1e7")).toThrow(/decimal number/);
    expect(() => validateStellarAmount("1E7")).toThrow(/decimal number/);
    expect(() => validateStellarAmount("1.5e2")).toThrow(/decimal number/);
  });

  // --- rejection: signed values ---
  it("rejects negative amounts", () => {
    expect(() => validateStellarAmount("-10")).toThrow(/decimal number/);
    expect(() => validateStellarAmount("-0.5")).toThrow(/decimal number/);
  });

  it("rejects explicitly positive-signed amounts", () => {
    expect(() => validateStellarAmount("+10")).toThrow(/decimal number/);
  });

  // --- rejection: non-numeric specials ---
  it("rejects NaN and Infinity strings", () => {
    expect(() => validateStellarAmount("NaN")).toThrow(/decimal number/);
    expect(() => validateStellarAmount("Infinity")).toThrow(/decimal number/);
    expect(() => validateStellarAmount("-Infinity")).toThrow(/decimal number/);
  });

  // --- rejection: embedded whitespace ---
  it("rejects amounts with embedded whitespace", () => {
    expect(() => validateStellarAmount("10 .5")).toThrow(/decimal number/);
    expect(() => validateStellarAmount("10. 5")).toThrow(/decimal number/);
    expect(() => validateStellarAmount("1 0")).toThrow(/decimal number/);
  });

  // --- rejection: empty / non-numeric strings ---
  it("rejects empty strings and pure text", () => {
    expect(() => validateStellarAmount("")).toThrow(/decimal number/);
    expect(() => validateStellarAmount("ten")).toThrow(/decimal number/);
    expect(() => validateStellarAmount("$10")).toThrow(/decimal number/);
  });
});

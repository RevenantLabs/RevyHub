import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import {
  createPaymentUri,
  validatePaymentMemo
} from "../../lib/stellar/paymentUri";

describe("createPaymentUri", () => {
  const destination = Keypair.random().publicKey();
  const validHash = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

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
    expect(uri).not.toContain("memo_type=");
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

  it("creates a payment URI for an ID memo with memo_type", () => {
    const uri = createPaymentUri({
      destination,
      amount: "10",
      asset: "XLM",
      memo: "9223372036854775807",
      memoType: "id"
    });

    expect(uri).toContain("memo=9223372036854775807");
    expect(uri).toContain("memo_type=MEMO_ID");
  });

  it("creates a payment URI for a hash memo with memo_type", () => {
    const uri = createPaymentUri({
      destination,
      amount: "10",
      asset: "XLM",
      memo: validHash.toUpperCase(),
      memoType: "hash"
    });

    expect(uri).toContain(`memo=${validHash}`);
    expect(uri).toContain("memo_type=MEMO_HASH");
  });

  it("creates a payment URI for a return memo with memo_type", () => {
    const uri = createPaymentUri({
      destination,
      amount: "10",
      asset: "XLM",
      memo: validHash,
      memoType: "return"
    });

    expect(uri).toContain(`memo=${validHash}`);
    expect(uri).toContain("memo_type=MEMO_RETURN");
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

  it("rejects non-positive and non-numeric amounts", () => {
    expect(() => createPaymentUri({ destination, amount: "0", asset: "XLM" })).toThrow(
      /positive payment amount/
    );

    expect(() => createPaymentUri({ destination, amount: "ten", asset: "XLM" })).toThrow(
      /positive payment amount/
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

  it("rejects invalid ID memo boundary values", () => {
    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "-1",
        memoType: "id"
      })
    ).toThrow(/whole number/);

    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "18446744073709551616",
        memoType: "id"
      })
    ).toThrow(/whole number/);

    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "12.5",
        memoType: "id"
      })
    ).toThrow(/whole number/);
  });

  it("rejects invalid hash and return memo boundary values", () => {
    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "abc123",
        memoType: "hash"
      })
    ).toThrow(/64 hexadecimal characters/);

    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: `${validHash}ff`,
        memoType: "return"
      })
    ).toThrow(/64 hexadecimal characters/);
  });
});

describe("validatePaymentMemo", () => {
  it("accepts valid memo values for each supported type", () => {
    expect(validatePaymentMemo("text", "Invoice 1001")).toBe("Invoice 1001");
    expect(validatePaymentMemo("id", "0")).toBe("0");
    expect(validatePaymentMemo("id", "18446744073709551615")).toBe("18446744073709551615");
    expect(
      validatePaymentMemo(
        "hash",
        "ABCDEF0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
      )
    ).toBe("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789");
    expect(
      validatePaymentMemo(
        "return",
        "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"
      )
    ).toBe("fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210");
  });

  it("rejects empty memo values", () => {
    expect(() => validatePaymentMemo("text", "   ")).toThrow(/Enter a memo value/);
  });
});

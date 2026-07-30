import { describe, expect, it } from "vitest";
import { Keypair, Networks } from "@stellar/stellar-sdk";
import { createPaymentUri, validatePaymentForm } from "../../lib/stellar/paymentUri";

describe("createPaymentUri", () => {
  const destination = Keypair.random().publicKey();

  it("creates a SEP-0007 payment URI for a valid native XLM request", () => {
    const uri = createPaymentUri({
      destination,
      amount: "10.5",
      asset: "XLM",
      memo: "Invoice 1001",
      network: "mainnet"
    });

    expect(uri).toContain("web+stellar:pay?");
    expect(uri).toContain(`destination=${encodeURIComponent(destination)}`);
    expect(uri).toContain("amount=10.5");
    expect(uri).toContain("memo=Invoice+1001");
    expect(uri).toContain("memo_type=MEMO_TEXT");
    // Native XLM omits asset_code/asset_issuer per SEP-0007.
    expect(uri).not.toContain("asset_code");
    expect(uri).not.toContain("asset_issuer");
    // The public network is the SEP-0007 default, so network_passphrase is omitted.
    expect(uri).not.toContain("network_passphrase");
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

  it("includes network_passphrase for testnet requests", () => {
    const uri = createPaymentUri({
      destination,
      amount: "10",
      asset: "XLM",
      network: "testnet"
    });

    const params = new URLSearchParams(uri.split("?")[1]);
    expect(params.get("network_passphrase")).toBe(Networks.TESTNET);
  });

  it("defaults to testnet network_passphrase when no network is provided", () => {
    const uri = createPaymentUri({ destination, amount: "10", asset: "XLM" });

    const params = new URLSearchParams(uri.split("?")[1]);
    expect(params.get("network_passphrase")).toBe(Networks.TESTNET);
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
    ).toThrow(/start with the letter G/);

    const invalidChecksum =
      destination.slice(0, -1) + (destination.endsWith("A") ? "B" : "A");
    expect(
      validatePaymentForm({
        destination: invalidChecksum,
        amount: "10",
        asset: "XLM"
      }).destination
    ).toMatch(/checksum/);
  });

  it("rejects non-positive and non-numeric amounts", () => {
    expect(() => createPaymentUri({ destination, amount: "0", asset: "XLM" })).toThrow(
      /positive payment amount/
    );

    expect(() => createPaymentUri({ destination, amount: "ten", asset: "XLM" })).toThrow(
      /positive payment amount/
    );

    for (const amount of ["-1", "Infinity", "NaN", ""]) {
      expect(
        validatePaymentForm({ destination, amount, asset: "XLM" }).amount
      ).toMatch(/positive payment amount/);
    }
  });

  it("preserves valid decimal amount boundaries", () => {
    const uri = createPaymentUri({
      destination,
      amount: "0.0000001",
      asset: "XLM"
    });

    expect(new URLSearchParams(uri.split("?")[1]).get("amount")).toBe("0.0000001");
  });

  it("rejects memo text longer than Stellar's 28-byte text-memo limit", () => {
    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "this memo is intentionally too long"
      })
    ).toThrow(/28 UTF-8 bytes or less/);

    expect(() =>
      createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "🚀".repeat(8)
      })
    ).toThrow(/28 UTF-8 bytes or less/);

    expect(
      validatePaymentForm({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "a".repeat(29)
      }).memo
    ).toMatch(/28 UTF-8 bytes or less/);
  });

  it("returns field-level validation errors and accepts a 28-byte memo", () => {
    const issuer = Keypair.random().publicKey();

    expect(
      validatePaymentForm({
        destination,
        amount: "1",
        asset: "XLM",
        memo: "a".repeat(28)
      })
    ).toEqual({});

    expect(
      validatePaymentForm({
        destination: "invalid",
        amount: "0",
        asset: "ISSUED",
        assetCode: "",
        assetIssuer: issuer,
        memo: "🚀".repeat(8)
      })
    ).toMatchObject({
      destination: expect.any(String),
      amount: expect.any(String),
      assetCode: expect.any(String),
      memo: expect.any(String)
    });
  });

  it("accepts issued asset-code boundaries and rejects missing issuer data", () => {
    const issuer = Keypair.random().publicKey();

    for (const assetCode of ["A", "ABCDEFGHIJKL"]) {
      const uri = createPaymentUri({
        destination,
        amount: "2",
        asset: "ISSUED",
        assetCode,
        assetIssuer: issuer
      });

      expect(new URLSearchParams(uri.split("?")[1]).get("asset_code")).toBe(assetCode);
    }

    expect(
      validatePaymentForm({
        destination,
        amount: "2",
        asset: "ISSUED",
        assetCode: "",
        assetIssuer: ""
      })
    ).toMatchObject({
      assetCode: expect.any(String),
      assetIssuer: expect.any(String)
    });
  });
});

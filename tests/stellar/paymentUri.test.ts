import { describe, expect, it } from "vitest";
import { Keypair, Networks } from "@stellar/stellar-sdk";
import {
  createPaymentUri,
  validatePaymentForm,
  validatePaymentMemo
} from "../../lib/stellar/paymentUri";

describe("createPaymentUri", () => {
  const destination = Keypair.random().publicKey();
  const validHash = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

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

import { describe, expect, it } from "vitest";
import { Keypair, Networks } from "@stellar/stellar-sdk";
import { createPaymentUri, validatePaymentForm, validateStellarAmount } from "../../lib/stellar/paymentUri";

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

  it("rejects zero amounts", () => {
    expect(() => createPaymentUri({ destination, amount: "0", asset: "XLM" })).toThrow(
      /positive payment amount/
    );
  });

  it("rejects non-numeric amounts", () => {
    expect(() => createPaymentUri({ destination, amount: "ten", asset: "XLM" })).toThrow(
      /decimal number/
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

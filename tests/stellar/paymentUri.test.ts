import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { createPaymentUri } from "../../lib/stellar/paymentUri";

describe("createPaymentUri", () => {
  const destination = Keypair.random().publicKey();

  describe("Valid form scenarios", () => {
    it("creates a payment URI for a valid native XLM request", () => {
      const uri = createPaymentUri({
        destination,
        amount: "10.5",
        asset: "XLM",
        memo: "Invoice 1001",
      });

      expect(uri).toContain("web+stellar:pay?");
      expect(uri).toContain(`destination=${encodeURIComponent(destination)}`);
      expect(uri).toContain("amount=10.5");
      expect(uri).toContain("asset_code=XLM");
      expect(uri).toContain("memo=Invoice+1001");
    });

    it("creates a payment URI with minimal valid form (destination and amount only)", () => {
      const uri = createPaymentUri({
        destination,
        amount: "5",
        asset: "XLM",
      });

      expect(uri).toContain("web+stellar:pay?");
      expect(uri).toContain(`destination=${encodeURIComponent(destination)}`);
      expect(uri).toContain("amount=5");
      expect(uri).toContain("asset_code=XLM");
    });

    it("creates a payment URI for a validated issued asset", () => {
      const issuer = Keypair.random().publicKey();
      const uri = createPaymentUri({
        destination,
        amount: "25",
        asset: "ISSUED",
        assetCode: "usdc",
        assetIssuer: issuer,
      });

      expect(uri).toContain("asset_code=USDC");
      expect(uri).toContain(`asset_issuer=${encodeURIComponent(issuer)}`);
    });

    it("creates a payment URI with amount having decimal precision", () => {
      const uri = createPaymentUri({
        destination,
        amount: "100.123456",
        asset: "XLM",
      });

      expect(uri).toContain("amount=100.123456");
    });

    it("creates a payment URI without memo when memo is empty", () => {
      const uri = createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "",
      });

      expect(uri).not.toContain("memo=");
    });

    it("creates a payment URI with whitespace-trimmed values", () => {
      const uri = createPaymentUri({
        destination: `  ${destination}  `,
        amount: "  10  ",
        asset: "XLM",
        memo: "  Test memo  ",
      });

      expect(uri).toContain(`destination=${encodeURIComponent(destination)}`);
      expect(uri).toContain("amount=10");
      expect(uri).toContain("memo=Test+memo");
    });
  });

  describe("Invalid destination scenarios", () => {
    it("rejects invalid destination addresses", () => {
      expect(() =>
        createPaymentUri({
          destination: "not-a-stellar-address",
          amount: "10",
          asset: "XLM",
        }),
      ).toThrow(/start with G/);
    });

    it("rejects empty destination address", () => {
      expect(() =>
        createPaymentUri({
          destination: "",
          amount: "10",
          asset: "XLM",
        }),
      ).toThrow(/Enter a Stellar public address/);
    });

    it("rejects destination address not starting with G", () => {
      expect(() =>
        createPaymentUri({
          destination:
            "SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          amount: "10",
          asset: "XLM",
        }),
      ).toThrow(/start with G/);
    });

    it("rejects destination address with invalid checksum", () => {
      expect(() =>
        createPaymentUri({
          destination:
            "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
          amount: "10",
          asset: "XLM",
        }),
      ).toThrow(/checksum or length/);
    });
  });

  describe("Invalid amount scenarios", () => {
    it("rejects zero amount", () => {
      expect(() =>
        createPaymentUri({ destination, amount: "0", asset: "XLM" }),
      ).toThrow(/positive payment amount/);
    });

    it("rejects negative amounts", () => {
      expect(() =>
        createPaymentUri({ destination, amount: "-10", asset: "XLM" }),
      ).toThrow(/positive payment amount/);
    });

    it("rejects non-numeric amounts", () => {
      expect(() =>
        createPaymentUri({ destination, amount: "ten", asset: "XLM" }),
      ).toThrow(/positive payment amount/);
    });

    it("rejects NaN and Infinity", () => {
      expect(() =>
        createPaymentUri({ destination, amount: "NaN", asset: "XLM" }),
      ).toThrow(/positive payment amount/);

      expect(() =>
        createPaymentUri({ destination, amount: "Infinity", asset: "XLM" }),
      ).toThrow(/positive payment amount/);
    });

    it("accepts very large valid amounts", () => {
      const uri = createPaymentUri({
        destination,
        amount: "922337203685.4775807",
        asset: "XLM",
      });

      expect(uri).toContain("amount=922337203685.4775807");
    });

    it("accepts very small valid decimal amounts", () => {
      const uri = createPaymentUri({
        destination,
        amount: "0.0000001",
        asset: "XLM",
      });

      expect(uri).toContain("amount=0.0000001");
    });
  });

  describe("Memo validation scenarios", () => {
    it("accepts empty memo (optional field)", () => {
      const uri = createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "",
      });

      expect(uri).not.toContain("memo=");
    });

    it("accepts memo at exactly 28 character limit", () => {
      const memo28Chars = "a".repeat(28);
      const uri = createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: memo28Chars,
      });

      expect(uri).toContain(`memo=${memo28Chars}`);
    });

    it("rejects memo longer than 28 characters", () => {
      expect(() =>
        createPaymentUri({
          destination,
          amount: "10",
          asset: "XLM",
          memo: "this memo is intentionally too long",
        }),
      ).toThrow(/28 characters or less/);
    });

    it("rejects memo with exactly 29 characters", () => {
      const memo29Chars = "a".repeat(29);
      expect(() =>
        createPaymentUri({
          destination,
          amount: "10",
          asset: "XLM",
          memo: memo29Chars,
        }),
      ).toThrow(/28 characters or less/);
    });

    it("accepts memo with special characters within limit", () => {
      const uri = createPaymentUri({
        destination,
        amount: "10",
        asset: "XLM",
        memo: "Invoice #123 - 2025",
      });

      expect(uri).toContain("memo=Invoice+%23123+-+2025");
    });
  });

  describe("Issued asset validation scenarios", () => {
    it("rejects issued assets without a valid code or issuer", () => {
      expect(() =>
        createPaymentUri({
          destination,
          amount: "10",
          asset: "ISSUED",
          assetCode: "TOO-LONG-ASSET-CODE",
          assetIssuer: Keypair.random().publicKey(),
        }),
      ).toThrow(/1 to 12/);

      expect(() =>
        createPaymentUri({
          destination,
          amount: "10",
          asset: "ISSUED",
          assetCode: "USDC",
          assetIssuer: "not-an-issuer",
        }),
      ).toThrow(/Asset issuer/);
    });

    it("accepts single character asset code", () => {
      const issuer = Keypair.random().publicKey();
      const uri = createPaymentUri({
        destination,
        amount: "10",

        asset: "ISSUED",
        assetCode: "X",
        assetIssuer: issuer,
      });

      expect(uri).toContain("asset_code=X");
    });

    it("accepts 12 character asset code at limit", () => {
      const issuer = Keypair.random().publicKey();
      const code12 = "A".repeat(12);
      const uri = createPaymentUri({
        destination,
        amount: "10",
        asset: "ISSUED",
        assetCode: code12,
        assetIssuer: issuer,
      });

      expect(uri).toContain(`asset_code=${code12}`);
    });

    it("rejects asset code longer than 12 characters", () => {
      const issuer = Keypair.random().publicKey();
      const code13 = "A".repeat(13);
      expect(() =>
        createPaymentUri({
          destination,
          amount: "10",
          asset: "ISSUED",
          assetCode: code13,
          assetIssuer: issuer,
        }),
      ).toThrow(/1 to 12/);
    });

    it("rejects empty asset code", () => {
      const issuer = Keypair.random().publicKey();
      expect(() =>
        createPaymentUri({
          destination,
          amount: "10",
          asset: "ISSUED",
          assetCode: "",
          assetIssuer: issuer,
        }),
      ).toThrow(/issued asset code/);
    });

    it("converts asset code to uppercase", () => {
      const issuer = Keypair.random().publicKey();
      const uri = createPaymentUri({
        destination,
        amount: "10",
        asset: "ISSUED",
        assetCode: "usdc",
        assetIssuer: issuer,
      });

      expect(uri).toContain("asset_code=USDC");
    });
  });
});

import { beforeAll, describe, expect, it, vi } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { checkTrustline } from "../../lib/stellar/trustline";

// vi.hoisted runs before the ES module graph is initialized, so we cannot call
// Keypair.random() from inside the hoisted factory — @stellar/stellar-sdk is
// not loaded yet. Instead, lift a stable holder that the mock factory can
// close over, then populate it from a beforeAll hook once imports are ready.
const mockIssuerRef = vi.hoisted(() => ({ publicKey: "" }));

vi.mock("../../lib/stellar/horizon", () => ({
  getHorizonServer: vi.fn(() => ({
    // Use mockImplementation rather than mockResolvedValue so mockIssuerRef.publicKey
    // is read lazily each call, after beforeAll has populated the real key.
    loadAccount: vi.fn().mockImplementation(() =>
      Promise.resolve({
        balances: [
          {
            asset_type: "credit_alphanum4",
            asset_code: "USDC",
            asset_issuer: mockIssuerRef.publicKey,
            balance: "100.0000000"
          }
        ]
      })
    )
  })),
  STELLAR_NETWORK: "testnet",
  horizonUrls: { testnet: "", mainnet: "" },
  horizonServer: {}
}));

let mockIssuerPublicKey = "";

beforeAll(() => {
  mockIssuerPublicKey = Keypair.random().publicKey();
  mockIssuerRef.publicKey = mockIssuerPublicKey;
});

describe("checkTrustline", () => {
  it("rejects an invalid account address before calling Horizon", async () => {
    await expect(checkTrustline("not-an-address", "USDC", mockIssuerPublicKey)).rejects.toThrow(
      /Account address/
    );
  });

  it("rejects an empty or whitespace-only asset code before calling Horizon", async () => {
    const account = Keypair.random().publicKey();

    await expect(checkTrustline(account, "   ", mockIssuerPublicKey)).rejects.toThrow(/asset code/);
  });

  it("rejects an invalid issuer address before calling Horizon", async () => {
    const account = Keypair.random().publicKey();

    await expect(checkTrustline(account, "USDC", "not-an-address")).rejects.toThrow(/Issuer address/);
  });

  it("normalizes the asset code, exposes the verified issuer, and identifies the selected network", async () => {
    const account = Keypair.random().publicKey();

    const result = await checkTrustline(account, "usdc", mockIssuerPublicKey, "mainnet");

    expect(result).toEqual(
      expect.objectContaining({
        exists: true,
        assetCode: "USDC",
        issuer: mockIssuerPublicKey,
        network: "mainnet"
      })
    );
    expect(result.message).toMatch(/Trustline found for USDC/);
  });

  it("reports missing trustline cleanly without inventing existence", async () => {
    const account = Keypair.random().publicKey();

    const result = await checkTrustline(account, "ETH", mockIssuerPublicKey, "testnet");

    expect(result.exists).toBe(false);
    expect(result.assetCode).toBe("ETH");
    expect(result.network).toBe("testnet");
    expect(result.message).toMatch(/No ETH trustline/);
  });
});

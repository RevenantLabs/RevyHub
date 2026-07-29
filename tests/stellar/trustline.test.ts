import { Keypair } from "@stellar/stellar-sdk";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockLoadAccount } = vi.hoisted(() => ({
  mockLoadAccount: vi.fn()
}));

vi.mock("@/lib/stellar/horizon", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stellar/horizon")>();

  return {
    ...actual,
    getHorizonServer: vi.fn(() => ({
      loadAccount: mockLoadAccount
    }))
  };
});

import { getHorizonServer } from "@/lib/stellar/horizon";
import { checkTrustline } from "@/lib/stellar/trustline";

describe("checkTrustline", () => {
  const accountAddress = Keypair.random().publicKey();
  const issuerAddress = Keypair.random().publicKey();
  const otherIssuerAddress = Keypair.random().publicKey();

  afterEach(() => {
    vi.clearAllMocks();
    mockLoadAccount.mockReset();
  });

  it("finds an existing trustline and normalizes the asset code", async () => {
    mockLoadAccount.mockResolvedValue({
      balances: [
        {
          asset_type: "native",
          balance: "100.0000000"
        },
        {
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer: issuerAddress,
          balance: "25.0000000",
          limit: "1000.0000000"
        }
      ]
    });

    await expect(
      checkTrustline(` ${accountAddress} `, " usdc ", ` ${issuerAddress} `, "mainnet")
    ).resolves.toEqual({
      exists: true,
      message: "Trustline found for USDC."
    });
    expect(getHorizonServer).toHaveBeenCalledWith("mainnet");
    expect(mockLoadAccount).toHaveBeenCalledWith(accountAddress);
  });

  it("reports a missing trustline when the asset code is absent", async () => {
    mockLoadAccount.mockResolvedValue({
      balances: [
        {
          asset_type: "credit_alphanum4",
          asset_code: "EURT",
          asset_issuer: issuerAddress,
          balance: "10.0000000",
          limit: "500.0000000"
        },
        {
          asset_type: "liquidity_pool_shares",
          liquidity_pool_id: "pool-id",
          balance: "2.0000000"
        }
      ]
    });

    await expect(
      checkTrustline(accountAddress, "USDC", issuerAddress)
    ).resolves.toEqual({
      exists: false,
      message: "No USDC trustline found for this account."
    });
  });

  it("requires an exact issuer match", async () => {
    mockLoadAccount.mockResolvedValue({
      balances: [
        {
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer: otherIssuerAddress,
          balance: "25.0000000",
          limit: "1000.0000000"
        }
      ]
    });

    await expect(
      checkTrustline(accountAddress, "usdc", issuerAddress)
    ).resolves.toMatchObject({
      exists: false
    });
  });

  it("rejects an invalid account without contacting Horizon", async () => {
    await expect(
      checkTrustline("not-an-account", "USDC", issuerAddress)
    ).rejects.toThrow("Account address:");
    expect(getHorizonServer).not.toHaveBeenCalled();
    expect(mockLoadAccount).not.toHaveBeenCalled();
  });

  it("rejects an invalid issuer without contacting Horizon", async () => {
    await expect(
      checkTrustline(accountAddress, "USDC", "not-an-issuer")
    ).rejects.toThrow("Issuer address:");
    expect(getHorizonServer).not.toHaveBeenCalled();
    expect(mockLoadAccount).not.toHaveBeenCalled();
  });

  it("returns the account-not-found error for a Horizon 404", async () => {
    mockLoadAccount.mockRejectedValue({
      response: {
        status: 404
      }
    });

    await expect(
      checkTrustline(accountAddress, "USDC", issuerAddress, "testnet")
    ).rejects.toThrow(
      "Account not found on Stellar testnet. Fund it before checking trustlines."
    );
  });

  it("returns a stable error for other Horizon failures", async () => {
    mockLoadAccount.mockRejectedValue(new Error("connection reset"));

    await expect(
      checkTrustline(accountAddress, "USDC", issuerAddress)
    ).rejects.toThrow(
      "Could not check trustline through Horizon. Try again shortly."
    );
  });
});

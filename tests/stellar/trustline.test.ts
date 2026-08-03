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
import { checkTrustline, getUSDCPreset, USDC_PRESETS } from "@/lib/stellar/trustline";

describe("USDC presets", () => {
  it("returns a USDC preset for testnet", () => {
    const preset = getUSDCPreset("testnet");
    expect(preset.code).toBe("USDC");
    expect(preset.issuer).toBe("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");
  });

  it("returns a USDC preset for mainnet", () => {
    const preset = getUSDCPreset("mainnet");
    expect(preset.code).toBe("USDC");
    expect(preset.issuer).toBe("GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");
  });

  it("testnet and mainnet have different USDC issuers", () => {
    const testnet = getUSDCPreset("testnet");
    const mainnet = getUSDCPreset("mainnet");
    expect(testnet.issuer).not.toBe(mainnet.issuer);
  });

  it("both presets have the same asset code", () => {
    const testnet = getUSDCPreset("testnet");
    const mainnet = getUSDCPreset("mainnet");
    expect(testnet.code).toBe(mainnet.code);
  });

  it("USDC_PRESETS object contains both networks", () => {
    expect(USDC_PRESETS).toHaveProperty("testnet");
    expect(USDC_PRESETS).toHaveProperty("mainnet");
  });
});

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
          limit: "1000.0000000",
          is_authorized: true,
          is_authorized_to_maintain_liabilities: false,
          is_clawback_enabled: false,
          buying_liabilities: "0.0000000",
          selling_liabilities: "0.0000000",
          last_modified_ledger: 1234
        }
      ]
    });

    await expect(
      checkTrustline(` ${accountAddress} `, " usdc ", ` ${issuerAddress} `, "mainnet")
    ).resolves.toEqual({
      exists: true,
      message: "Trustline found for USDC.",
      balance: "25.0000000",
      limit: "1000.0000000",
      authorization: {
        authorized: true,
        authorizedToMaintainLiabilities: false,
        clawbackEnabled: false
      },
      liabilities: {
        buying: "0.0000000",
        selling: "0.0000000"
      },
      lastModifiedLedger: 1234
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

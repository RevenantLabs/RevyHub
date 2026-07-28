import { describe, expect, it, vi, beforeEach } from "vitest";
import { checkTrustline, getUSDCPreset, USDC_PRESETS } from "../../lib/stellar/trustline";

type MockBalanceLine = {
  asset_type: string;
  asset_code: string;
  asset_issuer: string;
  balance: string;
  limit: string;
  buying_liabilities: string;
  selling_liabilities: string;
  last_modified_ledger: number;
  is_authorized: boolean;
  is_authorized_to_maintain_liabilities: boolean;
  is_clawback_enabled: boolean;
  sponsor?: string;
};

function makeTrustlineBalance(overrides: Partial<MockBalanceLine> = {}): MockBalanceLine {
  return {
    asset_type: "credit_alphanum4",
    asset_code: "USDC",
    asset_issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    balance: "100.0000000",
    limit: "1000000.0000000",
    buying_liabilities: "0.0000000",
    selling_liabilities: "0.0000000",
    last_modified_ledger: 1234567,
    is_authorized: true,
    is_authorized_to_maintain_liabilities: true,
    is_clawback_enabled: false,
    ...overrides
  };
}

vi.mock("../../lib/stellar/horizon", () => ({
  STELLAR_NETWORK: "testnet",
  getHorizonServer: vi.fn(() => ({
    loadAccount: vi.fn()
  }))
}));

vi.mock("../../lib/stellar/validateAddress", () => ({
  validatePublicKey: vi.fn(() => ({ valid: true, message: "" }))
}));

import { getHorizonServer } from "../../lib/stellar/horizon";

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns full details for an authorized trustline", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [makeTrustlineBalance()]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.exists).toBe(true);
    expect(result.balance).toBe("100.0000000");
    expect(result.limit).toBe("1000000.0000000");
    expect(result.authorization).toEqual({
      authorized: true,
      authorizedToMaintainLiabilities: true,
      clawbackEnabled: false
    });
    expect(result.liabilities).toEqual({
      buying: "0.0000000",
      selling: "0.0000000"
    });
    expect(result.lastModifiedLedger).toBe(1234567);
  });

  it("detects an unauthorized trustline", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [
        makeTrustlineBalance({
          is_authorized: false,
          is_authorized_to_maintain_liabilities: false
        })
      ]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.exists).toBe(true);
    expect(result.authorization?.authorized).toBe(false);
    expect(result.authorization?.authorizedToMaintainLiabilities).toBe(false);
  });

  it("detects liabilities-only authorization", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [
        makeTrustlineBalance({
          is_authorized: false,
          is_authorized_to_maintain_liabilities: true
        })
      ]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.exists).toBe(true);
    expect(result.authorization?.authorized).toBe(false);
    expect(result.authorization?.authorizedToMaintainLiabilities).toBe(true);
  });

  it("detects clawback-enabled trustline", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [
        makeTrustlineBalance({
          is_authorized: true,
          is_authorized_to_maintain_liabilities: true,
          is_clawback_enabled: true
        })
      ]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.exists).toBe(true);
    expect(result.authorization?.clawbackEnabled).toBe(true);
  });

  it("returns exists false when trustline is not found", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [
        makeTrustlineBalance({ asset_code: "DIFFERENT" })
      ]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.exists).toBe(false);
    expect(result.balance).toBeUndefined();
    expect(result.authorization).toBeUndefined();
    expect(result.liabilities).toBeUndefined();
  });

  it("returns exists false when only native and liquidity pool balances exist", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [
        {
          asset_type: "native",
          balance: "5000.0000000",
          buying_liabilities: "0.0000000",
          selling_liabilities: "0.0000000"
        }
      ]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.exists).toBe(false);
  });

  it("throws on empty asset code", async () => {
    await expect(
      checkTrustline(
        "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
        "",
        "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        "testnet"
      )
    ).rejects.toThrow("Enter an asset code");
  });

  it("handles Horizon 404 with testnet-specific message", async () => {
    const horizonError = { response: { status: 404 } };
    const mockLoadAccount = vi.fn().mockRejectedValue(horizonError);
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    await expect(
      checkTrustline(
        "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
        "USDC",
        "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        "testnet"
      )
    ).rejects.toThrow("Account not found on Stellar testnet");
  });

  it("handles Horizon 404 with mainnet-specific message", async () => {
    const horizonError = { response: { status: 404 } };
    const mockLoadAccount = vi.fn().mockRejectedValue(horizonError);
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    await expect(
      checkTrustline(
        "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
        "USDC",
        "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        "mainnet"
      )
    ).rejects.toThrow("Account not found on Stellar mainnet");
  });

  it("handles non-404 Horizon errors gracefully", async () => {
    const mockLoadAccount = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    await expect(
      checkTrustline(
        "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
        "USDC",
        "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        "testnet"
      )
    ).rejects.toThrow("Could not check trustline through Horizon");
  });

  it("preserves buying and selling liabilities when provided", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [
        makeTrustlineBalance({
          buying_liabilities: "50.0000000",
          selling_liabilities: "25.0000000"
        })
      ]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.liabilities).toEqual({
      buying: "50.0000000",
      selling: "25.0000000"
    });
  });

  it("detects unauthorized trustline with clawback enabled", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [
        makeTrustlineBalance({
          is_authorized: false,
          is_authorized_to_maintain_liabilities: false,
          is_clawback_enabled: true
        })
      ]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.exists).toBe(true);
    expect(result.authorization?.authorized).toBe(false);
    expect(result.authorization?.clawbackEnabled).toBe(true);
  });

  it("detects liabilities-only authorization with non-zero buying/ selling liabilities", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [
        makeTrustlineBalance({
          is_authorized: false,
          is_authorized_to_maintain_liabilities: true,
          is_clawback_enabled: false,
          buying_liabilities: "100.0000000",
          selling_liabilities: "50.0000000"
        })
      ]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.exists).toBe(true);
    expect(result.authorization?.authorized).toBe(false);
    expect(result.authorization?.authorizedToMaintainLiabilities).toBe(true);
    expect(result.liabilities).toEqual({
      buying: "100.0000000",
      selling: "50.0000000"
    });
  });

  it("ignores native balances and finds the correct asset trustline", async () => {
    const mockLoadAccount = vi.fn().mockResolvedValue({
      balances: [
        {
          asset_type: "native",
          balance: "5000.0000000",
          buying_liabilities: "0.0000000",
          selling_liabilities: "0.0000000"
        } as { asset_type: string; balance: string; buying_liabilities: string; selling_liabilities: string },
        makeTrustlineBalance()
      ]
    });
    vi.mocked(getHorizonServer).mockReturnValue({
      loadAccount: mockLoadAccount
    } as unknown as ReturnType<typeof getHorizonServer>);

    const result = await checkTrustline(
      "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "testnet"
    );

    expect(result.exists).toBe(true);
    expect(result.balance).toBe("100.0000000");
  });
});

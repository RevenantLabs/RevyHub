import { describe, expect, it, vi } from "vitest";
import type { DisplayBalance } from "@/components/stellar/BalanceList";

const mockLoadAccount = vi.fn();

vi.mock("@/lib/stellar/horizon", () => ({
  getHorizonServer: () => ({
    loadAccount: mockLoadAccount,
  }),
  STELLAR_NETWORK: "testnet",
}));

vi.mock("@/lib/stellar/validateAddress", () => ({
  validatePublicKey: () => ({ valid: true, message: "Valid" }),
}));

describe("getAccountBalances", () => {
  it("preserves buying and selling liabilities for native assets", async () => {
    mockLoadAccount.mockResolvedValue({
      balances: [
        {
          asset_type: "native",
          balance: "100.0000000",
          buying_liabilities: "5.0000000",
          selling_liabilities: "3.0000000",
        },
      ],
    });

    const { getAccountBalances } = await import("@/lib/stellar/account");
    const result: DisplayBalance[] = await getAccountBalances("GBOGSH4P4YZM2QSQZFXZO6Y5K4ZOZ7Z3U3YQ7N5Z4YQ6Z5Z5Z5Z5Z5Z5");

    expect(result[0].assetCode).toBe("XLM");
    expect(result[0].amount).toBe("100.0000000");
    expect(result[0].buyingLiabilities).toBe("5.0000000");
    expect(result[0].sellingLiabilities).toBe("3.0000000");
  });

  it("preserves buying and selling liabilities for issued assets", async () => {
    mockLoadAccount.mockResolvedValue({
      balances: [
        {
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer: "GA5ZSEJYB37JRC5AVCKA5L5PJOSZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5",
          balance: "200.0000000",
          buying_liabilities: "10.0000000",
          selling_liabilities: "7.5000000",
          limit: "10000.0000000",
        },
      ],
    });

    const { getAccountBalances } = await import("@/lib/stellar/account");
    const result: DisplayBalance[] = await getAccountBalances("GBOGSH4P4YZM2QSQZFXZO6Y5K4ZOZ7Z3U3YQ7N5Z4YQ6Z5Z5Z5Z5Z5Z5");

    expect(result[0].assetCode).toBe("USDC");
    expect(result[0].buyingLiabilities).toBe("10.0000000");
    expect(result[0].sellingLiabilities).toBe("7.5000000");
  });

  it("omits liabilities for liquidity pool shares", async () => {
    mockLoadAccount.mockResolvedValue({
      balances: [
        {
          asset_type: "liquidity_pool_shares",
          liquidity_pool_id: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          balance: "50.0000000",
        },
      ],
    });

    const { getAccountBalances } = await import("@/lib/stellar/account");
    const result: DisplayBalance[] = await getAccountBalances("GBOGSH4P4YZM2QSQZFXZO6Y5K4ZOZ7Z3U3YQ7N5Z4YQ6Z5Z5Z5Z5Z5Z5");

    expect(result[0].assetCode).toBe("Liquidity pool shares");
    expect(result[0].buyingLiabilities).toBeUndefined();
    expect(result[0].sellingLiabilities).toBeUndefined();
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { getAccountBalances, getResponseStatus } from "../../lib/stellar/account";

const { loadAccountMock, getHorizonServerMock } = vi.hoisted(() => {
  const loadAccountMock = vi.fn();
  const getHorizonServerMock = vi.fn(() => ({
    loadAccount: loadAccountMock
  }));

  return { loadAccountMock, getHorizonServerMock };
});

vi.mock("../../lib/stellar/horizon", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/stellar/horizon")>();

  return {
    ...actual,
    getHorizonServer: getHorizonServerMock,
    STELLAR_NETWORK: "testnet"
  };
});

describe("getAccountBalances", () => {
  const publicKey = Keypair.random().publicKey();
  const issuer = Keypair.random().publicKey();

  beforeEach(() => {
    loadAccountMock.mockReset();
    getHorizonServerMock.mockClear();
  });

  afterEach(() => {
    loadAccountMock.mockReset();
    getHorizonServerMock.mockReset();
  });

  it("normalizes native, credit, and pool balances from Horizon", async () => {
    loadAccountMock.mockResolvedValue({
      balances: [
        { asset_type: "native", balance: "100.0000000" },
        {
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer: issuer,
          balance: "50.0000000"
        },
        {
          asset_type: "liquidity_pool_shares",
          liquidity_pool_id:
            "0000000000000000000000000000000000000000000000000000000000000000",
          balance: "10.0000000"
        }
      ]
    });

    const balances = await getAccountBalances(publicKey, "testnet");

    expect(balances).toEqual([
      { assetCode: "XLM", amount: "100", isNative: true },
      {
        assetCode: "USDC",
        issuer,
        amount: "50"
      },
      {
        assetCode: "Liquidity pool shares",
        issuer: "0000000000000000000000000000000000000000000000000000000000000000",
        amount: "10"
      }
    ]);
    expect(getHorizonServerMock).toHaveBeenCalledWith("testnet");
    expect(loadAccountMock).toHaveBeenCalledWith(publicKey);
  });

  it("selects the Horizon server for the requested network", async () => {
    loadAccountMock.mockResolvedValue({ balances: [] });

    await getAccountBalances(publicKey, "mainnet");

    expect(getHorizonServerMock).toHaveBeenCalledWith("mainnet");
    expect(getHorizonServerMock).not.toHaveBeenCalledWith("testnet");
  });

  it("throws a testnet-specific message when the account is not found", async () => {
    loadAccountMock.mockRejectedValue({ response: { status: 404 } });

    await expect(getAccountBalances(publicKey, "testnet")).rejects.toThrow(
      "Account not found on Stellar testnet. Fund it with Friendbot first."
    );
  });

  it("throws a mainnet-specific message when the account is not found", async () => {
    loadAccountMock.mockRejectedValue({ response: { status: 404 } });

    await expect(getAccountBalances(publicKey, "mainnet")).rejects.toThrow(
      "Account not found on Stellar mainnet."
    );
  });

  it("throws a generic message for other Horizon failures", async () => {
    loadAccountMock.mockRejectedValue({ response: { status: 503 } });

    await expect(getAccountBalances(publicKey, "testnet")).rejects.toThrow(
      "Could not load account balances from Horizon. Try again in a moment."
    );
  });

  it("throws a generic message when Horizon errors lack a response status", async () => {
    loadAccountMock.mockRejectedValue(new Error("network unavailable"));

    await expect(getAccountBalances(publicKey, "testnet")).rejects.toThrow(
      "Could not load account balances from Horizon. Try again in a moment."
    );
  });

  it("rejects invalid public keys before calling Horizon", async () => {
    await expect(getAccountBalances("not-a-stellar-address", "testnet")).rejects.toThrow(
      /Stellar public addresses start with the letter G/
    );

    expect(getHorizonServerMock).not.toHaveBeenCalled();
  });
});

describe("getResponseStatus", () => {
  it("returns the HTTP status from Horizon-style errors", () => {
    expect(getResponseStatus({ response: { status: 404 } })).toBe(404);
  });

  it("returns undefined for non-response errors", () => {
    expect(getResponseStatus(new Error("timeout"))).toBeUndefined();
    expect(getResponseStatus(null)).toBeUndefined();
  });
});

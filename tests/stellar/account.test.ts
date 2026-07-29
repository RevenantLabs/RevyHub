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
  });
});

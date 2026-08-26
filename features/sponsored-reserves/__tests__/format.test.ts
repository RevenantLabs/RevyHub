import { describe, expect, it } from "vitest";
import { formatBalanceDetails } from "@/features/sponsored-reserves/lib/format";
import type { Horizon } from "@stellar/stellar-sdk";

describe("formatBalanceDetails", () => {
  it("formats native balance", () => {
    const balance = { asset_type: "native" } as Horizon.HorizonApi.BalanceLine;
    expect(formatBalanceDetails(balance)).toBe("XLM");
  });

  it("formats liquidity pool balance", () => {
    const balance = { asset_type: "liquidity_pool_shares" } as Horizon.HorizonApi.BalanceLine;
    expect(formatBalanceDetails(balance)).toBe("Liquidity Pool");
  });

  it("formats credit balance", () => {
    const balance = { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "G..." } as Horizon.HorizonApi.BalanceLine;
    expect(formatBalanceDetails(balance)).toBe("USDC:G...");
  });
});

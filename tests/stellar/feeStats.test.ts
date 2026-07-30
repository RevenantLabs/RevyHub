import { beforeEach, describe, expect, it, vi } from "vitest";

const { feeStatsMock } = vi.hoisted(() => ({
  feeStatsMock: vi.fn()
}));

vi.mock("@/lib/stellar/horizon", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stellar/horizon")>();

  return {
    ...actual,
    getHorizonServer: vi.fn(() => ({
      feeStats: feeStatsMock
    }))
  };
});

import { formatCapacityUsage, getFeeStats } from "@/lib/stellar/feeStats";

describe("getFeeStats", () => {
  beforeEach(() => {
    feeStatsMock.mockReset();
  });

  it("normalizes complete Horizon fee statistics without precision loss", async () => {
    feeStatsMock.mockResolvedValue({
      last_ledger: "123",
      last_ledger_base_fee: "100",
      ledger_capacity_usage: "0.42",
      fee_charged: {
        min: "100",
        mode: "200",
        p10: "300",
        p99: "9223372036854775807"
      }
    });

    const result = await getFeeStats("testnet");

    expect(result.lastLedger).toBe("123");
    expect(result.lastLedgerBaseFee).toEqual({ stroops: "100", xlm: "0.0000100" });
    expect(result.ledgerCapacityUsage).toBe("42.0%");
    expect(result.chargedMin).toEqual({ stroops: "100", xlm: "0.0000100" });
    expect(result.chargedPercentiles.find(({ label }) => label === "P99")?.value).toEqual({
      stroops: "9223372036854775807",
      xlm: "922337203685.4775807"
    });
  });

  it("degrades missing or unsupported fields to null", async () => {
    feeStatsMock.mockResolvedValue({
      ledger_capacity_usage: "not-a-number",
      fee_charged: {}
    });

    const result = await getFeeStats("mainnet");

    expect(result.lastLedger).toBeNull();
    expect(result.lastLedgerBaseFee).toBeNull();
    expect(result.ledgerCapacityUsage).toBeNull();
    expect(result.chargedMin).toBeNull();
    expect(result.chargedPercentiles.every(({ value }) => value === null)).toBe(true);
  });

  it("returns a stable network-specific error", async () => {
    feeStatsMock.mockRejectedValue(new Error("offline"));

    await expect(getFeeStats("testnet")).rejects.toThrow(
      "Could not load fee statistics from Stellar testnet Horizon"
    );
  });
});

describe("formatCapacityUsage", () => {
  it("rejects percentages outside Horizon's fractional range", () => {
    expect(formatCapacityUsage("-0.1")).toBeNull();
    expect(formatCapacityUsage("1.1")).toBeNull();
  });
});

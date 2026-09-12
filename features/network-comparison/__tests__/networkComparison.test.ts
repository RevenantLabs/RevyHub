import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import {
  compareAmounts,
  compareProtocols,
  runNetworkComparison
} from "@/features/network-comparison/lib/networkComparison";
import { toNetworkComparisonErrorCode } from "@/features/network-comparison/lib/networkComparison.errors";
import {
  bothErrorHandler,
  handlers,
  mainnetErrorHandler,
  testnetErrorHandler
} from "@/features/network-comparison/msw/handlers";
import {
  mockMainnetSnapshot,
  mockTestnetSnapshot
} from "@/features/network-comparison/fixtures/networkComparison.fixture";

const server = withMswHandlers(...handlers);

describe("toNetworkComparisonErrorCode", () => {
  it("maps network unavailability or timeout to both_unreachable", () => {
    const networkError = new TypeError("Failed to fetch");
    expect(toNetworkComparisonErrorCode(networkError)).toBe("both_unreachable");
  });

  it("maps other errors to request_failed", () => {
    expect(toNetworkComparisonErrorCode(new Error("Unexpected failure"))).toBe("request_failed");
  });
});

describe("compareProtocols", () => {
  it("detects when testnet is running ahead of mainnet", () => {
    const comparison = compareProtocols(mockTestnetSnapshot, mockMainnetSnapshot);
    expect(comparison.hasDifference).toBe(true);
    expect(comparison.testnetAhead).toBe(true);
    expect(comparison.differenceCount).toBe(1);
    expect(comparison.testnetProtocol).toBe(21);
    expect(comparison.mainnetProtocol).toBe(20);
  });

  it("detects when protocols are identical", () => {
    const comparison = compareProtocols(mockMainnetSnapshot, mockMainnetSnapshot);
    expect(comparison.hasDifference).toBe(false);
    expect(comparison.testnetAhead).toBe(false);
    expect(comparison.differenceCount).toBe(0);
  });
});

describe("compareAmounts", () => {
  it("calculates exact stroop difference without floating point math", () => {
    const result = compareAmounts("150", "100");
    expect(result.hasDifference).toBe(true);
    expect(result.differenceStroops).toBe("50");
  });

  it("handles identical amounts", () => {
    const result = compareAmounts("100", "100");
    expect(result.hasDifference).toBe(false);
    expect(result.differenceStroops).toBe("0");
  });

  it("handles null amounts gracefully", () => {
    const result = compareAmounts(null, "100");
    expect(result.hasDifference).toBe(false);
    expect(result.differenceStroops).toBe(null);
  });
});

describe("runNetworkComparison", () => {
  it("concurrently fetches testnet and mainnet snapshots on success", async () => {
    resetHorizonClients();
    const result = await runNetworkComparison({ refreshedAt: Date.now() });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.testnet.status).toBe("online");
    expect(result.value.mainnet.status).toBe("online");

    if (result.value.testnet.status === "online") {
      expect(result.value.testnet.protocolVersion).toBe(21);
      expect(result.value.testnet.ledgerSequence).toBe(1_234_567);
      expect(result.value.testnet.baseFeeInStroops).toBe("100");
      expect(result.value.testnet.baseReserveInStroops).toBe("5000000");
    }

    if (result.value.mainnet.status === "online") {
      expect(result.value.mainnet.protocolVersion).toBe(20);
      expect(result.value.mainnet.ledgerSequence).toBe(54_321_000);
      expect(result.value.mainnet.baseFeeInStroops).toBe("100");
      expect(result.value.mainnet.baseReserveInStroops).toBe("5000000");
    }

    expect(result.value.protocolComparison.hasDifference).toBe(true);
  });

  it("returns partial_failure and preserves surviving column when testnet fails", async () => {
    server.use(testnetErrorHandler);
    resetHorizonClients();

    const result = await runNetworkComparison({ refreshedAt: Date.now() });
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe("partial_failure");
    expect(result.detail).toBeDefined();

    const detail = result.detail;
    expect(detail?.testnet.status).toBe("unreachable");
    expect(detail?.mainnet.status).toBe("online");
    if (detail?.mainnet.status === "online") {
      expect(detail.mainnet.ledgerSequence).toBe(54_321_000);
    }
  });

  it("returns partial_failure and preserves surviving column when mainnet fails", async () => {
    server.use(mainnetErrorHandler);
    resetHorizonClients();

    const result = await runNetworkComparison({ refreshedAt: Date.now() });
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe("partial_failure");
    expect(result.detail).toBeDefined();

    const detail = result.detail;
    expect(detail?.mainnet.status).toBe("unreachable");
    expect(detail?.testnet.status).toBe("online");
    if (detail?.testnet.status === "online") {
      expect(detail.testnet.ledgerSequence).toBe(1_234_567);
    }
  });

  it("returns both_unreachable when neither endpoint responds", async () => {
    server.use(...bothErrorHandler);
    resetHorizonClients();

    const result = await runNetworkComparison({ refreshedAt: Date.now() });
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe("both_unreachable");
  });

  it("returns request_failed when the signal is aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await runNetworkComparison({ refreshedAt: Date.now() }, controller.signal);
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe("request_failed");
  });
});

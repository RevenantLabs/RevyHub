import { describe, expect, it, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { checkAssetStatistics } from "@/features/asset-statistics/lib/assetStatistics";
import { handlers } from "@/features/asset-statistics/msw/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("checkAssetStatistics", () => {
  it("returns asset statistics when found", async () => {
    const result = await checkAssetStatistics(
      { assetCode: "USDC", issuerId: "GBBD47IF6LWK7P7MDEVSCWTTCJM4NUIQ35M4MPMHEUEH9DMB2UCA36GZ" },
      "testnet"
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.supply).toBe("1234567.0000000");
      expect(result.value.flags.authRevocable).toBe(true);
      expect(result.value.accounts.authorized).toBe(12000);
    }
  });

  it("returns asset_not_found when no records match", async () => {
    const result = await checkAssetStatistics(
      { assetCode: "MISSING", issuerId: "GBBD47IF6LWK7P7MDEVSCWTTCJM4NUIQ35M4MPMHEUEH9DMB2UCA36GZ" },
      "testnet"
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("asset_not_found");
    }
  });

  it("returns rate_limited on 429", async () => {
    const result = await checkAssetStatistics(
      { assetCode: "RATE", issuerId: "GBBD47IF6LWK7P7MDEVSCWTTCJM4NUIQ35M4MPMHEUEH9DMB2UCA36GZ" },
      "testnet"
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("rate_limited");
    }
  });
});

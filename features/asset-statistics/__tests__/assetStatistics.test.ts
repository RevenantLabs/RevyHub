import { describe, expect, it } from "vitest";
import { runAssetStatistics } from "@/features/asset-statistics/lib/assetStatistics";

describe("runAssetStatistics", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runAssetStatistics({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});

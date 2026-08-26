import { describe, expect, it } from "vitest";
import { runAssetFlagsInspector } from "@/features/asset-flags-inspector/lib/asset-flags";

describe("runAssetFlagsInspector", () => {
  it("returns flags for a valid account", async () => {
    const result = await runAssetFlagsInspector(
      { accountId: "GDFE4JDBVZY7EDCDBKNTBW6H2MGBOQKHY344B6OOKQ6Q7T5IIVX7N2R3" },
      "testnet"
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.flags).toBeDefined();
    }
  });
});

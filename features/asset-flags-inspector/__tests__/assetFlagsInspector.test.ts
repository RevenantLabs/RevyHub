import { describe, expect, it } from "vitest";
import { runAssetFlagsInspector } from "@/features/asset-flags-inspector/lib/assetFlagsInspector";

describe("runAssetFlagsInspector", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runAssetFlagsInspector({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { runSep12KycReference } from "@/features/sep12-kyc-reference/lib/sep12KycReference";

describe("runSep12KycReference", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runSep12KycReference({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});

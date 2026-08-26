import { describe, expect, it } from "vitest";
import { runSponsoredReserves } from "@/features/sponsored-reserves/lib/sponsoredReserves";

describe("runSponsoredReserves", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runSponsoredReserves({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});

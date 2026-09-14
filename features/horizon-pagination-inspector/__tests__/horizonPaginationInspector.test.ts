import { describe, expect, it } from "vitest";
import { runHorizonPaginationInspector } from "@/features/horizon-pagination-inspector/lib/horizonPaginationInspector";

describe("runHorizonPaginationInspector", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runHorizonPaginationInspector({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});

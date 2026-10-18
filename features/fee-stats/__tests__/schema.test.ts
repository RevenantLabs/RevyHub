import { describe, expect, it } from "vitest";
import { parseFeeStatsRequest } from "@/features/fee-stats/schema";

describe("parseFeeStatsRequest", () => {
  it("always succeeds, because this tool takes no user input", () => {
    const result = parseFeeStatsRequest();
    expect(result.ok).toBe(true);
  });

  it("stamps the moment the request was made", () => {
    const before = Date.now();
    const result = parseFeeStatsRequest();
    expect(result.ok && result.value.refreshedAt).toBeGreaterThanOrEqual(before);
  });
});

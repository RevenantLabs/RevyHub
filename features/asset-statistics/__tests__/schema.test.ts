import { describe, expect, it } from "vitest";
import { parseAssetStatisticsInput } from "@/features/asset-statistics/schema";

describe("parseAssetStatisticsInput", () => {
  it("rejects empty input", () => {
    const result = parseAssetStatisticsInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseAssetStatisticsInput("  example  ");
    expect(result.ok && result.value.value).toBe("example");
  });
});

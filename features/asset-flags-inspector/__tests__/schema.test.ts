import { describe, expect, it } from "vitest";
import { parseAssetFlagsInspectorInput } from "@/features/asset-flags-inspector/schema";

describe("parseAssetFlagsInspectorInput", () => {
  it("rejects empty input", () => {
    const result = parseAssetFlagsInspectorInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects invalid stellar address", () => {
    const result = parseAssetFlagsInspectorInput("example");
    expect(result).toEqual({ ok: false, code: "invalid_address" });
  });

  it("normalises surrounding whitespace and returns accountId", () => {
    const result = parseAssetFlagsInspectorInput("  GDFE4JDBVZY7EDCDBKNTBW6H2MGBOQKHY344B6OOKQ6Q7T5IIVX7N2R3  ");
    expect(result.ok && result.value.accountId).toBe("GDFE4JDBVZY7EDCDBKNTBW6H2MGBOQKHY344B6OOKQ6Q7T5IIVX7N2R3");
  });
});

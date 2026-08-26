import { describe, expect, it } from "vitest";
import { parseAssetFlagsInspectorInput } from "@/features/asset-flags-inspector/schema";

describe("parseAssetFlagsInspectorInput", () => {
  it("rejects empty input", () => {
    const result = parseAssetFlagsInspectorInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseAssetFlagsInspectorInput("  example  ");
    expect(result.ok && result.value.value).toBe("example");
  });
});

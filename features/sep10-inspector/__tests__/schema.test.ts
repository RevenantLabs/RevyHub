import { describe, expect, it } from "vitest";
import { parseSep10InspectorInput } from "@/features/sep10-inspector/schema";

describe("parseSep10InspectorInput", () => {
  it("rejects empty input", () => {
    const result = parseSep10InspectorInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseSep10InspectorInput("  YWJj  ");
    expect(result.ok && result.value.xdr).toBe("YWJj");
  });
});

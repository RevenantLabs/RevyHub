import { describe, expect, it } from "vitest";
import { parseScvalCodecInput } from "@/features/scval-codec/schema";

describe("parseScvalCodecInput", () => {
  it("rejects empty input", () => {
    const result = parseScvalCodecInput("   ", "decode");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseScvalCodecInput("  example  ", "decode");
    expect(result.ok && result.value.value).toBe("example");
  });

  it("rejects an unknown mode", () => {
    const result = parseScvalCodecInput("example", "unknown");
    expect(result).toEqual({ ok: false, code: "invalid_json" });
  });

  it("accepts encode mode", () => {
    const result = parseScvalCodecInput("{}", "encode");
    expect(result.ok && result.value.mode).toBe("encode");
  });
});

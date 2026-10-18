import { describe, expect, it } from "vitest";
import { parseAnchorDiscoveryInput } from "@/features/anchor-discovery/schema";

describe("parseAnchorDiscoveryInput", () => {
  it("rejects empty input", () => {
    const result = parseAnchorDiscoveryInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseAnchorDiscoveryInput("  anchor.example  ");
    expect(result.ok && result.value.domain).toBe("anchor.example");
  });
});

import { describe, expect, it } from "vitest";
import { parseSponsoredReservesInput } from "@/features/sponsored-reserves/schema";

describe("parseSponsoredReservesInput", () => {
  it("rejects empty input", () => {
    const result = parseSponsoredReservesInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseSponsoredReservesInput("  example  ");
    expect(result.ok && result.value.value).toBe("example");
  });
});

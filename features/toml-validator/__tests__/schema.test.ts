import { describe, expect, it } from "vitest";
import { parseTomlValidatorInput } from "@/features/toml-validator/schema";

describe("parseTomlValidatorInput", () => {
  it("rejects empty input", () => {
    const result = parseTomlValidatorInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseTomlValidatorInput("  example.com  ");
    expect(result.ok && result.value.value).toBe("example.com");
    expect(result.ok && result.value.mode).toBe("domain");
  });
});

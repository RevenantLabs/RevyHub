import { describe, expect, it } from "vitest";
import { parseAccountMergePreflightInput } from "@/features/account-merge-preflight/schema";

describe("parseAccountMergePreflightInput", () => {
  it("rejects empty input", () => {
    const result = parseAccountMergePreflightInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseAccountMergePreflightInput("  example  ");
    expect(result.ok && result.value.value).toBe("example");
  });
});

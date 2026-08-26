import { describe, expect, it } from "vitest";
import { parseAccountDataEntriesInput } from "@/features/account-data-entries/schema";

describe("parseAccountDataEntriesInput", () => {
  it("rejects empty input", () => {
    const result = parseAccountDataEntriesInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseAccountDataEntriesInput("  example  ");
    expect(result.ok && result.value.value).toBe("example");
  });
});

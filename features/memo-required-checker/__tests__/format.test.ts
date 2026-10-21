import { describe, expect, it } from "vitest";
import { formatSignal, formatSources, formatVerdict, BEST_EFFORT_NOTICE } from "@/features/memo-required-checker/lib/format";

describe("format", () => {
  it("labels the combined verdict exactly", () => {
    expect(formatVerdict("required")).toBe("Memo required");
    expect(formatVerdict("not_required")).toBe("Memo not required");
  });

  it("labels each signal and an empty source list", () => {
    expect(formatSignal("required")).toBe("Requires a memo");
    expect(formatSignal("not_required")).toBe("Says a memo is not required");
    expect(formatSignal("absent")).toBe("No signal");
    expect(formatSources([])).toBe("Neither source requires a memo");
    expect(formatSources(["data_entry", "stellar_toml"])).toBe("SEP-29 data entry, stellar.toml");
  });

  it("keeps the best-effort wording", () => {
    expect(BEST_EFFORT_NOTICE).toMatch(/not a guarantee/i);
  });
});

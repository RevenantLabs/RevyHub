import { describe, expect, it } from "vitest";
import { mergeVerdict } from "@/features/memo-required-checker/lib/verdict-merge";

describe("mergeVerdict", () => {
  it("requires a memo when either source says so", () => {
    expect(mergeVerdict("required", "absent")).toEqual({
      verdict: "required",
      sources: ["data_entry"],
      conflict: false
    });
    expect(mergeVerdict("absent", "required").sources).toEqual(["stellar_toml"]);
  });

  it("labels a conflict when the data entry requires a memo and toml declines", () => {
    expect(mergeVerdict("required", "not_required")).toEqual({
      verdict: "required",
      sources: ["data_entry"],
      conflict: true
    });
  });

  it("returns an explicit not-required verdict when neither source requires a memo", () => {
    expect(mergeVerdict("absent", "absent")).toEqual({
      verdict: "not_required",
      sources: [],
      conflict: false
    });
    expect(mergeVerdict("absent", "not_required").verdict).toBe("not_required");
  });
});

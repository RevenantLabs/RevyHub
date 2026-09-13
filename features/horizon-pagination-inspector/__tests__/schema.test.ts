import { describe, expect, it } from "vitest";
import {
  MAX_INPUT_LENGTH,
  parseHorizonPaginationInspectorInput
} from "@/features/horizon-pagination-inspector/schema";

describe("parseHorizonPaginationInspectorInput", () => {
  it("rejects empty input", () => {
    expect(parseHorizonPaginationInspectorInput("   ")).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("trims the outer whitespace a paste picks up", () => {
    const result = parseHorizonPaginationInspectorInput('  { "a": 1 }  ');
    expect(result.ok && result.value.text).toBe('{ "a": 1 }');
  });

  it("preserves whitespace inside the document", () => {
    // Collapsing whitespace here would rewrite string values, so the schema is
    // required to pass the body through untouched.
    const body = '{ "memo": "two  spaces" }';
    const result = parseHorizonPaginationInspectorInput(body);
    expect(result.ok && result.value.text).toBe(body);
  });

  it("rejects input beyond the cap", () => {
    const oversized = "x".repeat(MAX_INPUT_LENGTH + 1);
    expect(parseHorizonPaginationInspectorInput(oversized)).toEqual({
      ok: false,
      code: "input_too_large"
    });
  });

  it("accepts input exactly at the cap", () => {
    const atCap = "x".repeat(MAX_INPUT_LENGTH);
    expect(parseHorizonPaginationInspectorInput(atCap).ok).toBe(true);
  });
});

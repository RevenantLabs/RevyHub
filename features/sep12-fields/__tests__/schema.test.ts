import { describe, expect, it } from "vitest";
import {
  MAX_QUERY_LENGTH,
  parseSep12FieldsInput
} from "@/features/sep12-fields/schema";

describe("parseSep12FieldsInput", () => {
  it("treats an empty query as a request for everything", () => {
    const result = parseSep12FieldsInput("   ");
    expect(result.ok && result.value.query).toBe("");
  });

  it("lowercases and trims", () => {
    const result = parseSep12FieldsInput("  First_Name  ");
    expect(result.ok && result.value.query).toBe("first_name");
  });

  it("preserves underscores and dots", () => {
    // These characters are the whole point of the tool: normalising them away
    // would make the canonical name indistinguishable from a near miss.
    const result = parseSep12FieldsInput("organization.VAT_number");
    expect(result.ok && result.value.query).toBe("organization.vat_number");
  });

  it("rejects a query that is really a pasted document", () => {
    expect(parseSep12FieldsInput("x".repeat(MAX_QUERY_LENGTH + 1))).toEqual({
      ok: false,
      code: "query_too_long"
    });
  });

  it("accepts a query exactly at the limit", () => {
    expect(parseSep12FieldsInput("x".repeat(MAX_QUERY_LENGTH)).ok).toBe(true);
  });
});

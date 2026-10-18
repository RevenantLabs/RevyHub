import { describe, expect, it } from "vitest";
import {
  MAX_BUDGET_BYTES,
  MAX_ENVELOPE_LENGTH,
  parseSizeInput
} from "@/features/transaction-size-analyzer/schema";
import {
  notBase64,
  secretSeed,
  twoOperationXdr
} from "@/features/transaction-size-analyzer/fixtures/transactionSize.fixture";

const envelope = twoOperationXdr;

describe("parseSizeInput", () => {
  it("rejects an empty envelope", () => {
    expect(parseSizeInput({ envelope: "  \n ", budget: "" })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("rejects text that is not base64", () => {
    expect(parseSizeInput({ envelope: notBase64, budget: "" })).toEqual({
      ok: false,
      code: "invalid_input"
    });
  });

  it("refuses a secret seed without echoing it", () => {
    const result = parseSizeInput({ envelope: secretSeed, budget: "" });

    expect(result).toEqual({ ok: false, code: "invalid_input" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("accepts an envelope exactly at the length cap", () => {
    expect(parseSizeInput({ envelope: "A".repeat(MAX_ENVELOPE_LENGTH), budget: "" }).ok).toBe(
      true
    );
  });

  it("rejects an envelope past the length cap", () => {
    expect(parseSizeInput({ envelope: "A".repeat(MAX_ENVELOPE_LENGTH + 4), budget: "" })).toEqual({
      ok: false,
      code: "input_too_large"
    });
  });

  it("treats a blank budget as no budget rather than as zero", () => {
    expect(parseSizeInput({ envelope, budget: "   " })).toEqual({
      ok: true,
      value: { envelope, budgetBytes: null }
    });
  });

  it("accepts a positive whole number of bytes", () => {
    expect(parseSizeInput({ envelope, budget: " 1024 " })).toEqual({
      ok: true,
      value: { envelope, budgetBytes: 1024 }
    });
  });

  it("rejects zero and negative budgets", () => {
    expect(parseSizeInput({ envelope, budget: "0" })).toEqual({
      ok: false,
      code: "invalid_budget"
    });
    expect(parseSizeInput({ envelope, budget: "-1" })).toEqual({
      ok: false,
      code: "invalid_budget"
    });
  });

  it("rejects the forms Number() would silently accept", () => {
    // Each of these coerces to a number, and none of them is what a user meant
    // to type into a byte field.
    for (const budget of ["1e3", "12.9", "0x10", "1,024", "Infinity", " 12 3"]) {
      expect(parseSizeInput({ envelope, budget })).toEqual({
        ok: false,
        code: "invalid_budget"
      });
    }
  });

  it("accepts a budget exactly at the cap and rejects one past it", () => {
    expect(parseSizeInput({ envelope, budget: String(MAX_BUDGET_BYTES) }).ok).toBe(true);
    expect(parseSizeInput({ envelope, budget: String(MAX_BUDGET_BYTES + 1) })).toEqual({
      ok: false,
      code: "invalid_budget"
    });
  });

  it("checks the envelope before the budget", () => {
    // A user with two problems should be told about the envelope first.
    expect(parseSizeInput({ envelope: "", budget: "nope" })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("strips whitespace from a wrapped paste", () => {
    const wrapped = `${envelope.slice(0, 40)}\n  ${envelope.slice(40)}`;
    expect(parseSizeInput({ envelope: wrapped, budget: "" })).toEqual({
      ok: true,
      value: { envelope, budgetBytes: null }
    });
  });
});

import { describe, expect, it } from "vitest";
import { parseClaimablePredicateBuilderInput } from "@/features/claimable-predicate-builder/schema";

describe("parseClaimablePredicateBuilderInput", () => {
  it("rejects empty input", () => {
    const result = parseClaimablePredicateBuilderInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects invalid JSON", () => {
    const result = parseClaimablePredicateBuilderInput("not json");
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe("invalid_input");
    }
  });

  it("parses a simple absolute-before predicate", () => {
    const result = parseClaimablePredicateBuilderInput(
      '{"type":"abs_before","timestamp":1893456000000}'
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.predicate).toEqual({ type: "abs_before", timestamp: 1893456000000 });
    }
  });

  it("rejects an unknown predicate type", () => {
    const result = parseClaimablePredicateBuilderInput('{"type":"unknown"}');
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe("invalid_input");
    }
  });

  it("rejects a negative timestamp", () => {
    const result = parseClaimablePredicateBuilderInput('{"type":"abs_before","timestamp":-1}');
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe("invalid_time_bound");
    }
  });

  it("rejects too deeply nested predicates", () => {
    const deep = JSON.stringify({
      type: "not",
      child: {
        type: "not",
        child: {
          type: "not",
          child: {
            type: "not",
            child: { type: "not", child: { type: "not", child: { type: "unconditional" } } }
          }
        }
      }
    });
    const result = parseClaimablePredicateBuilderInput(deep);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe("too_deeply_nested");
    }
  });
});

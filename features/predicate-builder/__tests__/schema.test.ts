import { describe, expect, it } from "vitest";
import { parsePredicateBuilderInput, validatePredicateNode } from "@/features/predicate-builder/schema";
import type { RawPredicateForm } from "@/features/predicate-builder/types";

describe("validatePredicateNode", () => {
  it("validates unconditional predicate", () => {
    const raw: RawPredicateForm = { type: "unconditional" };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ type: "unconditional" });
  });

  it("validates before_absolute with valid timestamp", () => {
    const raw: RawPredicateForm = {
      type: "before_absolute",
      timestamp: "2027-01-01T00:00:00Z"
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe("before_absolute");
    if (result.value.type !== "before_absolute") return;
    expect(result.value.timestamp).toBeGreaterThan(0);
  });

  it("rejects before_absolute with invalid timestamp", () => {
    const raw: RawPredicateForm = {
      type: "before_absolute",
      timestamp: "not-a-date"
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_timestamp");
  });

  it("rejects before_absolute with empty timestamp", () => {
    const raw: RawPredicateForm = {
      type: "before_absolute",
      timestamp: ""
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_timestamp");
  });

  it("validates before_relative with valid duration", () => {
    const raw: RawPredicateForm = {
      type: "before_relative",
      seconds: "86400"
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ type: "before_relative", seconds: 86400 });
  });

  it("rejects before_relative with negative duration", () => {
    const raw: RawPredicateForm = {
      type: "before_relative",
      seconds: "-100"
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_duration");
  });

  it("rejects before_relative with decimal duration", () => {
    const raw: RawPredicateForm = {
      type: "before_relative",
      seconds: "86400.5"
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_duration");
  });

  it("validates AND with two children", () => {
    const raw: RawPredicateForm = {
      type: "and",
      children: [
        { type: "unconditional" },
        { type: "unconditional" }
      ]
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe("and");
    if (result.value.type !== "and") return;
    expect(result.value.children).toHaveLength(2);
  });

  it("rejects AND with fewer than two children", () => {
    const raw: RawPredicateForm = {
      type: "and",
      children: [{ type: "unconditional" }]
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_and_children");
  });

  it("rejects AND with no children", () => {
    const raw: RawPredicateForm = {
      type: "and",
      children: []
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_and_children");
  });

  it("validates OR with two children", () => {
    const raw: RawPredicateForm = {
      type: "or",
      children: [
        { type: "unconditional" },
        { type: "unconditional" }
      ]
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe("or");
    if (result.value.type !== "or") return;
    expect(result.value.children).toHaveLength(2);
  });

  it("rejects OR with fewer than two children", () => {
    const raw: RawPredicateForm = {
      type: "or",
      children: [{ type: "unconditional" }]
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_or_children");
  });

  it("validates NOT with one child", () => {
    const raw: RawPredicateForm = {
      type: "not",
      child: { type: "unconditional" }
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.type).toBe("not");
    if (result.value.type !== "not") return;
    expect(result.value.child).toEqual({ type: "unconditional" });
  });

  it("rejects NOT without a child", () => {
    const raw: RawPredicateForm = {
      type: "not"
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_not_child");
  });

  it("rejects unsupported predicate type", () => {
    const raw: RawPredicateForm = {
      type: "invalid_type"
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("unsupported_type");
  });

  it("validates nested predicates", () => {
    const raw: RawPredicateForm = {
      type: "and",
      children: [
        { type: "unconditional" },
        {
          type: "or",
          children: [
            { type: "unconditional" },
            {
              type: "not",
              child: { type: "unconditional" }
            }
          ]
        }
      ]
    };
    const result = validatePredicateNode(raw);
    
    expect(result.ok).toBe(true);
  });
});

describe("parsePredicateBuilderInput", () => {
  it("rejects null input", () => {
    const result = parsePredicateBuilderInput(null);
    
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("empty_predicate");
  });

  it("accepts valid predicate", () => {
    const raw: RawPredicateForm = { type: "unconditional" };
    const result = parsePredicateBuilderInput(raw);
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.predicate).toEqual({ type: "unconditional" });
  });
});

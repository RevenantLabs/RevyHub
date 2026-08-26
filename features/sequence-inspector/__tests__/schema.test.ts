import { describe, expect, it } from "vitest";
import { parseSequenceInspectorInput } from "@/features/sequence-inspector/schema";
import { accountId } from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

describe("parseSequenceInspectorInput", () => {
  it("rejects empty account id", () => {
    const result = parseSequenceInspectorInput("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("empty_input");
    }
  });

  it("rejects invalid account id", () => {
    const result = parseSequenceInspectorInput("invalid");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_address");
    }
  });

  it("rejects non-numeric bump target", () => {
    const result = parseSequenceInspectorInput(accountId, "abc");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_bump_target");
    }
  });

  it("rejects out of range bump target", () => {
    const result = parseSequenceInspectorInput(accountId, "9223372036854775808");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_bump_target");
    }
  });

  it("normalises surrounding whitespace and parses valid input", () => {
    const result = parseSequenceInspectorInput(`  ${accountId}  `, " 123 ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accountId).toBe(accountId);
      expect(result.value.bumpTarget).toBe("123");
    }
  });
});

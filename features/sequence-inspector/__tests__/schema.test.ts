import { describe, expect, it } from "vitest";
import { INT64_MAX, parseSequenceInspectorInput } from "@/features/sequence-inspector/schema";
import {
  accountId,
  secretSeed
} from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

describe("parseSequenceInspectorInput", () => {
  it("rejects empty input", () => {
    const result = parseSequenceInspectorInput({ accountId: "   " });
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("validates the StrKey checksum and trims a public address", () => {
    expect(parseSequenceInspectorInput({ accountId: "G".repeat(56) })).toEqual({
      ok: false,
      code: "invalid_address"
    });

    const result = parseSequenceInspectorInput({ accountId: `  ${accountId}  ` });
    expect(result.ok && result.value.accountId).toBe(accountId);
  });

  it("rejects a secret seed by prefix without retaining it", () => {
    const result = parseSequenceInspectorInput({ accountId: secretSeed });
    expect(result).toEqual({ ok: false, code: "invalid_address" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it.each(["0", "-1", "+1", "1.5", "1e18", `${INT64_MAX + 1n}`])(
    "rejects invalid bump target %s",
    (bumpTarget) => {
      expect(parseSequenceInspectorInput({ accountId, bumpTarget })).toEqual({
        ok: false,
        code: "invalid_bump_target"
      });
    }
  );

  it("accepts the signed int64 maximum without coercing it to Number", () => {
    const bumpTarget = INT64_MAX.toString();
    expect(parseSequenceInspectorInput({ accountId, bumpTarget })).toEqual({
      ok: true,
      value: { accountId, bumpTarget }
    });
  });
});

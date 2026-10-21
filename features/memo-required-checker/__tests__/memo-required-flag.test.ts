import { describe, expect, it } from "vitest";
import { readMemoRequiredFlag } from "@/features/memo-required-checker/lib/memo-required-flag";
import {
  malformedFlag,
  requiredFlag,
  unrelatedData
} from "@/features/memo-required-checker/fixtures/memo-required-flag.fixture";

describe("readMemoRequiredFlag", () => {
  it("reads the SEP-29 value 1 as required", () => {
    expect(readMemoRequiredFlag(requiredFlag)).toEqual({ ok: true, value: "required" });
  });

  it("treats a missing key as an absent signal", () => {
    expect(readMemoRequiredFlag(unrelatedData)).toEqual({ ok: true, value: "absent" });
    expect(readMemoRequiredFlag({})).toEqual({ ok: true, value: "absent" });
  });

  it("rejects any value other than 1", () => {
    expect(readMemoRequiredFlag(malformedFlag)).toEqual({ ok: false, code: "malformed_data_entry" });
    expect(readMemoRequiredFlag({ "config.memo_required": "not-base64" })).toEqual({
      ok: false,
      code: "malformed_data_entry"
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  FIELD_OF_CODE,
  parseAccountMergePreflightInput
} from "@/features/account-merge-preflight/schema";
import {
  destinationAccountId,
  secretSeed,
  sourceAccountId
} from "@/features/account-merge-preflight/fixtures/accountMergePreflight.fixture";

const valid = { sourceAccountId, destinationAccountId };

describe("parseAccountMergePreflightInput", () => {
  it("rejects empty input", () => {
    expect(parseAccountMergePreflightInput({ ...valid, sourceAccountId: "   " })).toEqual({
      ok: false,
      code: "empty_source"
    });
    expect(parseAccountMergePreflightInput({ ...valid, destinationAccountId: "" })).toEqual({
      ok: false,
      code: "empty_destination"
    });
  });

  it("validates both StrKey checksums independently", () => {
    expect(parseAccountMergePreflightInput({ ...valid, sourceAccountId: "G".repeat(56) })).toEqual({
      ok: false,
      code: "invalid_source"
    });
    expect(
      parseAccountMergePreflightInput({ ...valid, destinationAccountId: "G".repeat(56) })
    ).toEqual({ ok: false, code: "invalid_destination" });
  });

  it("normalizes whitespace introduced by wrapped terminal output", () => {
    const wrappedSource = `${sourceAccountId.slice(0, 20)}\n ${sourceAccountId.slice(20)}`;
    const result = parseAccountMergePreflightInput({
      sourceAccountId: wrappedSource,
      destinationAccountId: ` ${destinationAccountId} `
    });
    expect(result).toEqual({ ok: true, value: valid });
  });

  it("rejects identical accounts before any request", () => {
    expect(
      parseAccountMergePreflightInput({
        sourceAccountId,
        destinationAccountId: sourceAccountId
      })
    ).toEqual({ ok: false, code: "same_account" });
  });

  it("rejects secret-shaped input without retaining it", () => {
    const sourceResult = parseAccountMergePreflightInput({
      sourceAccountId: secretSeed,
      destinationAccountId
    });
    const destinationResult = parseAccountMergePreflightInput({
      sourceAccountId,
      destinationAccountId: secretSeed
    });
    expect(sourceResult).toEqual({ ok: false, code: "invalid_source" });
    expect(destinationResult).toEqual({ ok: false, code: "invalid_destination" });
    expect(JSON.stringify([sourceResult, destinationResult])).not.toContain(secretSeed);
  });

  it("maps field-specific failures to exactly one input", () => {
    expect(FIELD_OF_CODE.source_not_found).toBe("sourceAccountId");
    expect(FIELD_OF_CODE.destination_not_found).toBe("destinationAccountId");
    expect(FIELD_OF_CODE.same_account).toBe("destinationAccountId");
    expect(FIELD_OF_CODE.request_failed).toBeNull();
  });
});

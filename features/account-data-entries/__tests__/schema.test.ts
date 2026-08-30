import { describe, expect, it } from "vitest";
import { parseAccountDataEntriesInput } from "@/features/account-data-entries/schema";
import {
  accountId,
  secretSeed
} from "@/features/account-data-entries/fixtures/accountDataEntries.fixture";

describe("parseAccountDataEntriesInput", () => {
  it("rejects empty input", () => {
    expect(parseAccountDataEntriesInput("   ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const spaced = `${accountId.slice(0, 10)} ${accountId.slice(10)}`;
    const result = parseAccountDataEntriesInput(`  ${spaced}  `);
    expect(result.ok && result.value.accountId).toBe(accountId);
  });

  it("rejects a secret seed before checksum validation", () => {
    expect(parseAccountDataEntriesInput(secretSeed)).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("accepts a valid account address", () => {
    expect(parseAccountDataEntriesInput(accountId)).toEqual({
      ok: true,
      value: { accountId }
    });
  });
});

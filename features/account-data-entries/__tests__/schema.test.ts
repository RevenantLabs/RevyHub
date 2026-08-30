import { describe, expect, it } from "vitest";
import { parseAccountDataEntriesInput } from "@/features/account-data-entries/schema";
import {
  accountId,
  secretSeed
} from "@/features/account-data-entries/fixtures/accountDataEntries.fixture";

describe("parseAccountDataEntriesInput", () => {
  it("rejects empty input", () => {
    const result = parseAccountDataEntriesInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects a value that fails the StrKey checksum", () => {
    expect(parseAccountDataEntriesInput(accountId.slice(0, -1))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("rejects a secret seed on its prefix", () => {
    expect(parseAccountDataEntriesInput(secretSeed)).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("accepts a valid account address with stray whitespace", () => {
    const result = parseAccountDataEntriesInput(`  ${accountId}\n`);
    expect(result.ok && result.value.accountId).toBe(accountId);
  });
});

import { describe, expect, it } from "vitest";
import { parseSponsoredReservesInput } from "@/features/sponsored-reserves/schema";
import {
  accountId,
  secretSeed
} from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";

describe("parseSponsoredReservesInput", () => {
  it("rejects empty input", () => {
    expect(parseSponsoredReservesInput(" \n ")).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("rejects an address with a missing checksum character", () => {
    expect(parseSponsoredReservesInput(accountId.slice(0, -1))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("rejects a secret seed on its prefix without echoing it", () => {
    const result = parseSponsoredReservesInput(secretSeed);
    expect(result).toEqual({ ok: false, code: "invalid_address" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("rejects non-account StrKeys", () => {
    expect(parseSponsoredReservesInput("C".repeat(56))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("accepts a checksum-valid account address with pasted whitespace", () => {
    const result = parseSponsoredReservesInput(`  ${accountId}\n`);
    expect(result.ok && result.value.accountId).toBe(accountId);
  });
});

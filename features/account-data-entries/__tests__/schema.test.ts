import { describe, expect, it } from "vitest";
import { parseAccountDataEntriesInput } from "../schema";
import { Keypair } from "@stellar/stellar-sdk";

describe("parseAccountDataEntriesInput", () => {
  it("returns ok for valid account ID", () => {
    const pub = Keypair.random().publicKey();
    const res = parseAccountDataEntriesInput(pub);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.accountId).toBe(pub);
    }
  });

  it("returns err for empty input", () => {
    const res = parseAccountDataEntriesInput("   ");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("empty_input");
    }
  });

  it("returns err for invalid account ID", () => {
    const res = parseAccountDataEntriesInput("INVALID");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("invalid_account_id");
    }
  });
});

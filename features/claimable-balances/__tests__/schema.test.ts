import { describe, expect, it } from "vitest";
import { parseClaimableBalancesInput } from "@/features/claimable-balances/schema";
import {
  balanceId,
  claimantAccount
} from "@/features/claimable-balances/fixtures/claimableBalances.fixture";

describe("parseClaimableBalancesInput", () => {
  it("rejects empty account input", () => {
    const result = parseClaimableBalancesInput({
      mode: "account",
      accountId: "   ",
      balanceId: ""
    });
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects an invalid claimant account", () => {
    const result = parseClaimableBalancesInput({
      mode: "account",
      accountId: "not-an-account",
      balanceId: ""
    });
    expect(result).toEqual({ ok: false, code: "invalid_input" });
  });

  it("accepts a valid claimant account", () => {
    const result = parseClaimableBalancesInput({
      mode: "account",
      accountId: claimantAccount,
      balanceId: ""
    });
    expect(result).toEqual({ ok: true, value: { mode: "account", accountId: claimantAccount } });
  });

  it("rejects an invalid balance ID", () => {
    const result = parseClaimableBalancesInput({
      mode: "balance",
      accountId: "",
      balanceId: "abc"
    });
    expect(result).toEqual({ ok: false, code: "invalid_input" });
  });

  it("normalises balance IDs to lowercase", () => {
    const result = parseClaimableBalancesInput({
      mode: "balance",
      accountId: "",
      balanceId: balanceId.toUpperCase()
    });
    expect(result.ok && result.value).toEqual({ mode: "balance", balanceId });
  });
});

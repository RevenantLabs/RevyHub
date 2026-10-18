import { describe, expect, it } from "vitest";
import { parseFaucetInput } from "@/features/testnet-faucet/schema";
import {
  newAccountId,
  secretSeed
} from "@/features/testnet-faucet/fixtures/testnetFaucet.fixture";

describe("parseFaucetInput", () => {
  it("rejects empty input", () => {
    expect(parseFaucetInput("  ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects a secret seed", () => {
    expect(parseFaucetInput(secretSeed)).toEqual({ ok: false, code: "invalid_address" });
  });

  it("rejects a value that fails the checksum", () => {
    expect(parseFaucetInput(newAccountId.slice(0, -1))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("accepts a valid public address with stray whitespace", () => {
    expect(parseFaucetInput(` ${newAccountId} `)).toEqual({
      ok: true,
      value: { accountId: newAccountId }
    });
  });
});

import { describe, expect, it } from "vitest";
import { STARTING_BALANCE, explorerUrl, formatLedger } from "@/features/testnet-faucet/lib/format";
import { toFaucetErrorCode } from "@/features/testnet-faucet/lib/friendbot.errors";
import { newAccountId } from "@/features/testnet-faucet/fixtures/testnetFaucet.fixture";

describe("formatLedger", () => {
  it("says so when no ledger was reported", () => {
    expect(formatLedger(undefined)).toBe("Not reported");
    expect(formatLedger(1017700)).toBe("1017700");
  });
});

describe("explorerUrl", () => {
  it("always links to the testnet explorer", () => {
    expect(explorerUrl(newAccountId)).toContain("/explorer/testnet/account/");
    expect(explorerUrl(newAccountId)).toContain(newAccountId);
  });
});

describe("STARTING_BALANCE", () => {
  it("states the amount Friendbot grants", () => {
    expect(STARTING_BALANCE).toMatch(/XLM/);
  });
});

describe("toFaucetErrorCode", () => {
  it("treats a transport failure as the faucet being unavailable", () => {
    expect(toFaucetErrorCode(new Error("failed to fetch"))).toBe("friendbot_unavailable");
  });

  it("treats an abort as a plain request failure", () => {
    expect(toFaucetErrorCode(new Error("The operation was aborted"))).toBe("request_failed");
  });
});

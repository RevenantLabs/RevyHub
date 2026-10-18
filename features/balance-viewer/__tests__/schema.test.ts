import { describe, expect, it } from "vitest";
import { parseBalanceViewerInput } from "@/features/balance-viewer/schema";
import { accountId } from "@/features/balance-viewer/fixtures/balanceViewer.fixture";

describe("parseBalanceViewerInput", () => {
  it("rejects empty input", () => {
    expect(parseBalanceViewerInput("  ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects a value that fails the checksum", () => {
    expect(parseBalanceViewerInput(accountId.slice(0, -1))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("rejects a secret seed", () => {
    expect(parseBalanceViewerInput("S".repeat(56))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("accepts a valid account address with stray whitespace", () => {
    const result = parseBalanceViewerInput(`  ${accountId}\n`);
    expect(result.ok && result.value.accountId).toBe(accountId);
  });
});

import { describe, expect, it } from "vitest";
import { parseOperationBrowserInput } from "@/features/operation-browser/schema";
import {
  accountId,
  secretSeed
} from "@/features/operation-browser/fixtures/operationBrowser.fixture";

describe("parseOperationBrowserInput", () => {
  it("rejects empty input", () => {
    expect(parseOperationBrowserInput("   ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("accepts a valid public key", () => {
    const result = parseOperationBrowserInput(`  ${accountId}  `);
    expect(result.ok && result.value.accountId).toBe(accountId);
  });

  it("rejects an invalid address", () => {
    expect(parseOperationBrowserInput("not-an-address")).toEqual({ ok: false, code: "invalid_address" });
  });

  it("rejects a secret seed on its prefix without retaining it", () => {
    const result = parseOperationBrowserInput(secretSeed);
    expect(result).toEqual({ ok: false, code: "invalid_address" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });
});

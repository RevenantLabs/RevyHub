import { describe, expect, it } from "vitest";
import { parseOfferInspectorInput } from "@/features/offer-inspector/schema";
import { accountId } from "@/features/offer-inspector/fixtures/offerInspector.fixture";

describe("parseOfferInspectorInput", () => {
  it("rejects empty input", () => {
    expect(parseOfferInspectorInput("   ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects a value that fails the checksum", () => {
    expect(parseOfferInspectorInput(accountId.slice(0, -1))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("rejects a secret seed starting with S", () => {
    expect(parseOfferInspectorInput("SB".repeat(28))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("accepts a valid account address with stray whitespace", () => {
    const result = parseOfferInspectorInput(`  ${accountId}\n `);
    expect(result.ok && result.value.accountId).toBe(accountId);
  });
});


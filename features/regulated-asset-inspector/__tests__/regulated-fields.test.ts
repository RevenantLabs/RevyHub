import { describe, expect, it } from "vitest";
import {
  matchCurrency,
  parseRegulatedCurrencies
} from "@/features/regulated-asset-inspector/lib/regulated-fields";
import {
  issuerId,
  regulatedToml,
  unregulatedToml
} from "@/features/regulated-asset-inspector/fixtures/regulatedAssetInspector.fixture";

describe("regulated fields", () => {
  it("reads a regulated currency and its approval fields", () => {
    const match = matchCurrency(parseRegulatedCurrencies(regulatedToml), "USDC", issuerId);
    expect(match?.regulated).toBe(true);
    expect(match?.regulatedFieldPresent).toBe(true);
    expect(match?.approvalServer).toBe("https://issuer.example/approve");
  });

  it("keeps an omitted regulated field distinct from regulated=false", () => {
    const match = matchCurrency(parseRegulatedCurrencies(unregulatedToml), "USDC", issuerId);
    expect(match?.regulatedFieldPresent).toBe(false);
    expect(match?.regulated).toBeUndefined();
  });

  it("does not match a different issuer", () => {
    expect(matchCurrency(parseRegulatedCurrencies(regulatedToml), "USDC", "GDIFFERENT")).toBeNull();
  });
});

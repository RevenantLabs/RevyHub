import { describe, expect, it } from "vitest";
import {
  amountToStroops,
  formatAsset,
  stroopsToAmount
} from "@/features/account-merge-preflight/lib/format";

describe("exact XLM formatting", () => {
  it("parses seven decimal places without floating-point arithmetic", () => {
    expect(amountToStroops("922337203685.4775807")).toBe(9_223_372_036_854_775_807n);
    expect(amountToStroops("1.2")).toBe(12_000_000n);
  });

  it.each(["", "-1", "+1", "1.00000001", "1e3", "01.0"])(
    "rejects malformed amount %s",
    (amount) => expect(amountToStroops(amount)).toBeNull()
  );

  it("formats stroops with exactly seven decimal places", () => {
    expect(stroopsToAmount(12_000_001n)).toBe("1.2000001");
  });
});

describe("formatAsset", () => {
  it("names native and issued assets concretely", () => {
    expect(formatAsset({ asset_type: "native" })).toBe("XLM");
    expect(
      formatAsset({ asset_type: "credit_alphanum4", asset_code: "USD", asset_issuer: "GISSUER" })
    ).toBe("USD:GISSUER");
  });
});

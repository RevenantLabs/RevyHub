import { describe, expect, it } from "vitest";
import { copy } from "@/features/effects-timeline/copy";
import {
  formatAmount,
  formatAmountWithAsset,
  formatAsset,
  formatCanonicalAsset,
  formatEffectType,
  formatIdentifier,
  formatTimestamp,
  toStroops
} from "@/features/effects-timeline/lib/format";
import { issuer } from "@/features/effects-timeline/fixtures/effectsTimeline.fixture";

describe("toStroops", () => {
  it("converts without touching a float", () => {
    expect(toStroops("1")).toBe(10_000_000n);
    expect(toStroops("0.0000001")).toBe(1n);
    expect(toStroops("1.23")).toBe(12_300_000n);
    expect(toStroops("-2.5")).toBe(-25_000_000n);
  });

  it("stays exact at the int64 ceiling, where Number cannot", () => {
    expect(toStroops("922337203685.4775807")).toBe(9_223_372_036_854_775_807n);
  });
});

describe("formatAmount", () => {
  it("groups thousands and drops trailing zeros", () => {
    expect(formatAmount("1200.0000000")).toBe("1,200");
    expect(formatAmount("91.4285714")).toBe("91.4285714");
    expect(formatAmount("0.0000001")).toBe("0.0000001");
  });

  it("keeps the largest representable amount exact", () => {
    expect(formatAmount("922337203685.4775807")).toBe("922,337,203,685.4775807");
  });

  it("handles the zero boundary", () => {
    expect(formatAmount("0")).toBe("0");
    expect(formatAmount("0.0000000")).toBe("0");
  });

  it("passes anything that is not a Stellar amount through untouched", () => {
    expect(formatAmount("not-a-number")).toBe("not-a-number");
    expect(formatAmount("1.12345678")).toBe("1.12345678");
  });
});

describe("formatAsset", () => {
  it("names the native asset", () => {
    expect(formatAsset("native")).toBe(copy.nativeAsset);
  });

  it("shows the code with a shortened issuer", () => {
    expect(formatAsset("credit_alphanum4", "USDC", issuer)).toContain("USDC");
    expect(formatAsset("credit_alphanum4", "USDC", issuer)).toContain(issuer.slice(0, 4));
  });

  it("falls back when Horizon reports no code", () => {
    expect(formatAsset("credit_alphanum4")).toBe(copy.unknownAsset);
  });

  it("reads the canonical CODE:ISSUER form used by claimable balances", () => {
    expect(formatCanonicalAsset("native")).toBe(copy.nativeAsset);
    expect(formatCanonicalAsset(`USDC:${issuer}`)).toContain("USDC");
    expect(formatCanonicalAsset(undefined)).toBe(copy.unknownAsset);
  });
});

describe("formatAmountWithAsset", () => {
  it("pairs a formatted amount with its asset", () => {
    expect(formatAmountWithAsset("1200.0000000", copy.nativeAsset)).toBe("1,200 XLM");
  });
});

describe("formatEffectType", () => {
  it("reads a snake_cased type as a sentence", () => {
    expect(formatEffectType("account_credited")).toBe("Account credited");
    expect(formatEffectType("claimable_balance_clawed_back")).toBe("Claimable balance clawed back");
  });

  it("prefers an override where the raw type reads badly", () => {
    expect(formatEffectType("trade")).toBe(copy.effectTypeLabels.trade);
    expect(formatEffectType("data_updated")).toBe(copy.effectTypeLabels.data_updated);
  });
});

describe("formatIdentifier", () => {
  it("middle-truncates long identifiers and leaves short ones alone", () => {
    expect(formatIdentifier(issuer)).toContain("...");
    expect(formatIdentifier("4451236")).toBe("4451236");
  });
});

describe("formatTimestamp", () => {
  it("renders Horizon's ISO timestamp as readable UTC", () => {
    expect(formatTimestamp("2026-04-01T00:00:50.000Z")).toBe("2026-04-01 00:00:50 UTC");
  });

  it("returns an unparseable timestamp verbatim", () => {
    expect(formatTimestamp("soon")).toBe("soon");
  });
});

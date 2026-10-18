import { describe, expect, it } from "vitest";
import {
  MAX_LIMIT,
  describeAuthorization,
  formatAssetIdentity,
  formatLimit
} from "@/features/trustline-checker/lib/format";

describe("formatLimit", () => {
  it("describes the maximum int64 limit in words", () => {
    expect(formatLimit(MAX_LIMIT)).toMatch(/no practical limit/i);
  });

  it("passes a real limit through unchanged", () => {
    expect(formatLimit("1000.0000000")).toBe("1000.0000000");
  });
});

describe("formatAssetIdentity", () => {
  it("uses the canonical CODE:ISSUER form", () => {
    expect(formatAssetIdentity("USDC", "GABC")).toBe("USDC:GABC");
  });
});

describe("describeAuthorization", () => {
  it("separates the three authorization states", () => {
    expect(describeAuthorization(true, true)).toBe("Authorized");
    expect(describeAuthorization(false, true)).toMatch(/maintain liabilities/i);
    expect(describeAuthorization(false, false)).toBe("Not authorized");
  });
});

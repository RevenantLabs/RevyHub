import { describe, expect, it } from "vitest";
import {
  formatBoolean,
  formatOptional,
  formatReachability,
  formatThresholds,
  formatWeight,
  shortenKey,
  sortSigners
} from "@/features/signer-rotation-impact-auditor/lib/format";
import { accountId, cosignerId } from "@/features/signer-rotation-impact-auditor/fixtures/normal.fixture";

describe("format helpers", () => {
  it("keeps weight strings lossless and marks absence", () => {
    expect(formatWeight("255")).toBe("255");
    expect(formatWeight("0")).toBe("0");
    expect(formatWeight(null)).toBe("—");
  });

  it("formats thresholds without inventing zeros", () => {
    expect(formatThresholds({ low: "1", medium: null, high: "3" })).toBe("1 / — / 3");
  });

  it("shortens keys without losing identity ends", () => {
    expect(shortenKey(accountId)).toContain("…");
    expect(shortenKey(accountId).startsWith(accountId.slice(0, 4))).toBe(true);
    expect(shortenKey(accountId).endsWith(accountId.slice(-4))).toBe(true);
  });

  it("sorts master signers first then by key", () => {
    const sorted = sortSigners([
      {
        key: cosignerId,
        weight: "2",
        kind: "ed25519_public_key",
        isMaster: false
      },
      {
        key: accountId,
        weight: "1",
        kind: "ed25519_public_key",
        isMaster: true
      }
    ]);

    expect(sorted[0].isMaster).toBe(true);
    expect(sorted[0].key).toBe(accountId);
  });

  it("formats reachability and booleans for display", () => {
    expect(
      formatReachability({
        level: "high",
        required: "2",
        available: "1",
        shortfall: "1",
        reachable: false
      })
    ).toBe("unreachable");
    expect(
      formatReachability({
        level: "low",
        required: null,
        available: null,
        shortfall: null,
        reachable: null
      })
    ).toBe("unavailable");
    expect(formatBoolean(true)).toBe("yes");
    expect(formatOptional(null)).toBe("—");
  });
});

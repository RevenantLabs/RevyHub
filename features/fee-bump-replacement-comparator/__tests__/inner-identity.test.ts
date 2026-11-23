import { describe, expect, it } from "vitest";
import {
  compareInnerIdentity,
  isEquivalentInner
} from "@/features/fee-bump-replacement-comparator/lib/inner-identity";

describe("compareInnerIdentity", () => {
  it("requires both hash and payload match for equivalence", () => {
    const same = compareInnerIdentity("aa", "aa", "payload", "payload");
    expect(same.equivalent).toBe(true);
    expect(same.reason).toBe("equivalent");
    expect(isEquivalentInner(same)).toBe(true);
  });

  it("refuses when only the network-aware hashes differ", () => {
    const result = compareInnerIdentity("aa", "bb", "payload", "payload");
    expect(result.equivalent).toBe(false);
    expect(result.hashesMatch).toBe(false);
    expect(result.payloadsMatch).toBe(true);
    expect(result.reason).toBe("hash_mismatch");
    expect(isEquivalentInner(result)).toBe(false);
  });

  it("refuses when only the signature-free payloads differ", () => {
    const result = compareInnerIdentity("aa", "aa", "left", "right");
    expect(result.equivalent).toBe(false);
    expect(result.reason).toBe("payload_mismatch");
  });

  it("refuses when both identity signals disagree", () => {
    const result = compareInnerIdentity("aa", "bb", "left", "right");
    expect(result.reason).toBe("hash_and_payload_mismatch");
    expect(result.equivalent).toBe(false);
  });

  it("treats empty payloads as a real comparison, not missing evidence", () => {
    const result = compareInnerIdentity("aa", "aa", "", "");
    expect(result.payloadsMatch).toBe(true);
    expect(result.equivalent).toBe(true);
  });
});

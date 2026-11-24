import { describe, expect, it } from "vitest";
import { displayExact, formatVerdict } from "@/features/claimable-predicate-evaluator/lib/format";
import { claimantA } from "@/features/claimable-predicate-evaluator/fixtures/normal.fixture";
describe("lossless display", () => {
  it("keeps long decimals and full identities", () => { expect(displayExact("922337203685.4775807")).toBe("922337203685.4775807"); expect(displayExact(claimantA)).toBe(claimantA); });
  it("labels unknown explicitly", () => expect(formatVerdict("unknown")).toBe("Unknown"));
});

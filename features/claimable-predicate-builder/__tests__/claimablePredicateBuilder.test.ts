import { describe, expect, it } from "vitest";
import { runClaimablePredicateBuilder } from "@/features/claimable-predicate-builder/lib/claimablePredicateBuilder";

describe("runClaimablePredicateBuilder", () => {
  it("returns a description, XDR and timeline for an unconditional predicate", async () => {
    const result = await runClaimablePredicateBuilder({
      predicate: { type: "unconditional" }
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.description).toBe("can be claimed at any time");
      expect(result.value.xdr.length).toBeGreaterThan(0);
      expect(result.value.timeline).toEqual([{ from: 0, to: null }]);
      expect(result.value.unsatisfiable).toBe(false);
    }
  });

  it("returns an error for an unsatisfiable predicate", async () => {
    const result = await runClaimablePredicateBuilder({
      predicate: {
        type: "and",
        children: [
          { type: "abs_before", timestamp: 1000 },
          { type: "abs_after", timestamp: 2000 }
        ]
      }
    });
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe("unsatisfiable");
    }
  });

  it("returns a timeline for an absolute-before predicate", async () => {
    const result = await runClaimablePredicateBuilder({
      predicate: { type: "abs_before", timestamp: 1893456000000 }
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.description).toContain("before");
      expect(result.value.timeline).toEqual([{ from: 0, to: 1893456000000 }]);
    }
  });
});

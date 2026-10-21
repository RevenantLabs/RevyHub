import { describe, expect, it } from "vitest";
import { MAX_VISIBLE_CANDIDATES, rankCandidates } from "@/features/strkey-corruption-locator/lib/candidate-rank";
import type { CorrectionCandidate } from "@/features/strkey-corruption-locator/types";

function candidate(position: number, replacement: string): CorrectionCandidate {
  return {
    position,
    originalCharacter: "A",
    replacement,
    corrected: `G${replacement}${position}`,
    kind: "ed25519PublicKey"
  };
}

describe("rankCandidates", () => {
  it("orders by position, then by alphabet", () => {
    const ranked = rankCandidates([
      candidate(4, "C"),
      candidate(1, "M"),
      candidate(1, "B"),
      candidate(4, "A")
    ]);

    expect(ranked.visible.map((item) => [item.position, item.replacement])).toEqual([
      [1, "B"],
      [1, "M"],
      [4, "A"],
      [4, "C"]
    ]);
  });

  it("shows at most the documented bound and keeps the earliest positions", () => {
    const many = Array.from({ length: MAX_VISIBLE_CANDIDATES + 4 }, (_, index) =>
      candidate(index + 1, "C")
    );

    const ranked = rankCandidates(many);

    expect(MAX_VISIBLE_CANDIDATES).toBe(8);
    expect(ranked.total).toBe(MAX_VISIBLE_CANDIDATES + 4);
    expect(ranked.visible).toHaveLength(MAX_VISIBLE_CANDIDATES);
    expect(ranked.visible[0]?.position).toBe(1);
    expect(ranked.visible.at(-1)?.position).toBe(MAX_VISIBLE_CANDIDATES);
  });
});

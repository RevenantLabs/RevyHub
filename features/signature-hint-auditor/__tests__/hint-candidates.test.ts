import { describe, expect, it } from "vitest";
import {
  buildGroupReports,
  candidatesForHint,
  countCollisions,
  countUnmatched,
  matchDecoratedHint
} from "@/features/signature-hint-auditor/lib/hint-candidates";
import {
  collidingCandidates,
  collisionHint,
  distinctCandidate
} from "@/features/signature-hint-auditor/fixtures/hint-collision.fixture";
import {
  extraSigner,
  extraSignerHint,
  source,
  sourceHint
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";
import type { DecoratedSignatureEntry, PublicSignerHint } from "@/features/signature-hint-auditor/types";

const sourceCandidate: PublicSignerHint = {
  publicKey: source.publicKey(),
  hint: sourceHint
};

const extraCandidate: PublicSignerHint = {
  publicKey: extraSigner.publicKey(),
  hint: extraSignerHint
};

describe("candidatesForHint", () => {
  it("returns zero candidates when nothing matches", () => {
    expect(candidatesForHint(sourceHint, [extraCandidate])).toEqual([]);
  });

  it("returns a single candidate for an exact hint match", () => {
    expect(candidatesForHint(sourceHint, [sourceCandidate, extraCandidate])).toEqual([
      source.publicKey()
    ]);
  });

  it("returns every colliding candidate without picking a winner", () => {
    expect(candidatesForHint(collisionHint, collidingCandidates)).toEqual([
      collidingCandidates[0].publicKey,
      collidingCandidates[1].publicKey
    ]);
  });
});

describe("matchDecoratedHint", () => {
  const entry: DecoratedSignatureEntry = {
    index: 0,
    hint: sourceHint,
    group: "transaction"
  };

  it("labels a miss as none", () => {
    expect(matchDecoratedHint(entry, [extraCandidate]).matchKind).toBe("none");
  });

  it("labels one match as single", () => {
    expect(matchDecoratedHint(entry, [sourceCandidate]).matchKind).toBe("single");
  });

  it("labels multiple matches as collision", () => {
    expect(
      matchDecoratedHint(
        { index: 0, hint: collisionHint, group: "transaction" },
        collidingCandidates
      ).matchKind
    ).toBe("collision");
  });
});

describe("buildGroupReports", () => {
  it("keeps fee-bump outer and inner groups apart", () => {
    const entries: DecoratedSignatureEntry[] = [
      { index: 0, hint: "aaaaaaaa", group: "fee_bump_outer" },
      { index: 0, hint: sourceHint, group: "fee_bump_inner" }
    ];

    const reports = buildGroupReports(entries, [sourceCandidate], [
      "fee_bump_outer",
      "fee_bump_inner"
    ]);

    expect(reports.map((report) => report.group)).toEqual([
      "fee_bump_outer",
      "fee_bump_inner"
    ]);
    expect(reports[1]?.signatures[0]?.matchKind).toBe("single");
    expect(reports[0]?.signatures[0]?.matchKind).toBe("none");
  });

  it("still lists an empty transaction group for unsigned classic envelopes", () => {
    const reports = buildGroupReports([], [sourceCandidate], ["transaction"]);

    expect(reports).toEqual([{ group: "transaction", signatures: [] }]);
  });
});

describe("collision counters", () => {
  it("counts collisions and unmatched rows", () => {
    const matches = [
      matchDecoratedHint(
        { index: 0, hint: collisionHint, group: "transaction" },
        collidingCandidates
      ),
      matchDecoratedHint(
        { index: 1, hint: distinctCandidate.hint, group: "transaction" },
        collidingCandidates
      )
    ];

    expect(countCollisions(matches)).toBe(1);
    expect(countUnmatched(matches)).toBe(1);
  });
});

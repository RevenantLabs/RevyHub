import { describe, expect, it } from "vitest";
import {
  diffEnvelopes,
  envelopeKind,
  flattenEnvelope,
  sortKey,
  toJsonSummary
} from "@/features/transaction-envelope-diff/lib/envelopeDiff";
import { parseDiffInput } from "@/features/transaction-envelope-diff/schema";
import type { DiffEntry, DiffSummary } from "@/features/transaction-envelope-diff/types";
import {
  PASSPHRASE,
  baseXdr,
  changedAmountXdr,
  changedDestinationXdr,
  changedMemoXdr,
  differentlySignedXdr,
  extraOperationXdr,
  feeBumpXdr,
  higherFeeBumpXdr,
  notAnEnvelopeXdr,
  preciseAmountXdr,
  reorderedXdr,
  signedXdr,
  v0Xdr,
  whitespaceXdr
} from "@/features/transaction-envelope-diff/fixtures/envelopeDiff.fixture";

function diff(left: string, right: string) {
  const parsed = parseDiffInput({ left, right, networkPassphrase: PASSPHRASE });
  if (!parsed.ok) throw new Error(`fixture failed to parse: ${parsed.code}`);
  return diffEnvelopes(parsed.value);
}

function changedPaths(summary: DiffSummary): string[] {
  return summary.entries
    .filter((entry: DiffEntry) => entry.status !== "unchanged")
    .map((entry) => entry.path);
}

function expectDiff(left: string, right: string): DiffSummary {
  const result = diff(left, right);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.code);
  return result.value;
}

describe("diffEnvelopes", () => {
  it("reports two identical envelopes as identical", () => {
    const summary = expectDiff(baseXdr, baseXdr);

    expect(summary.identical).toBe(true);
    expect(summary.changedCount).toBe(0);
    expect(summary.unchangedCount).toBeGreaterThan(0);
  });

  it("ignores whitespace and line wrapping", () => {
    // Whitespace is stripped in the schema, so the decoder never sees it.
    const summary = expectDiff(baseXdr, whitespaceXdr);
    expect(summary.identical).toBe(true);
  });

  it("pinpoints a single changed amount and nothing else in the body", () => {
    const summary = expectDiff(baseXdr, changedAmountXdr);
    const paths = changedPaths(summary);

    expect(paths).toContain("tx.operations[0].amount");
    expect(paths).toContain("tx.operations[0].xdr");
    // The second operation and the body are untouched.
    expect(paths.some((path) => path.startsWith("tx.operations[1]"))).toBe(false);
    expect(paths).not.toContain("tx.memo.value");
    expect(paths).not.toContain("tx.sequence");
  });

  it("keeps decimal amounts exact rather than rounding them through Number", () => {
    const summary = expectDiff(baseXdr, preciseAmountXdr);
    const entry = summary.entries.find((item) => item.path === "tx.operations[0].amount");

    // The SDK normalises to all seven places; the value stays a decimal
    // string throughout, so the seventh place — the one a float would lose —
    // is the only thing that differs here.
    expect(entry?.before).toBe("10.5000000");
    expect(entry?.after).toBe("10.5000001");
    expect(entry?.status).toBe("changed");
  });

  it("treats a reordering as a change", () => {
    const summary = expectDiff(baseXdr, reorderedXdr);

    expect(summary.identical).toBe(false);
    const paths = changedPaths(summary);
    // Both positions changed type — the operations were compared by position.
    expect(paths).toContain("tx.operations[0].type");
    expect(paths).toContain("tx.operations[1].type");
  });

  it("notices a changed destination", () => {
    const summary = expectDiff(baseXdr, changedDestinationXdr);
    expect(changedPaths(summary)).toContain("tx.operations[0].destination");
  });

  it("notices a changed memo", () => {
    const summary = expectDiff(baseXdr, changedMemoXdr);
    expect(changedPaths(summary)).toContain("tx.memo.value");
  });

  it("reports an added operation as added rather than as a count change alone", () => {
    const summary = expectDiff(baseXdr, extraOperationXdr);
    const paths = changedPaths(summary);

    expect(paths).toContain("tx.operations.count");
    expect(paths).toContain("tx.operations[2].type");
    expect(
      summary.entries.find((entry) => entry.path === "tx.operations[2].type")?.status
    ).toBe("added");
  });

  it("flags a signature-only change without touching the body", () => {
    const summary = expectDiff(baseXdr, signedXdr);

    expect(summary.identical).toBe(false);
    expect(summary.signaturesOnly).toBe(true);
    expect(changedPaths(summary).every((path) => path.includes("signatures"))).toBe(true);
  });

  it("still reports signatures-only when the signer changes", () => {
    const summary = expectDiff(signedXdr, differentlySignedXdr);

    expect(summary.signaturesOnly).toBe(true);
    expect(changedPaths(summary)).toContain("tx.signatures[0].hint");
  });

  it("does not claim signatures-only when the body changed too", () => {
    const summary = expectDiff(signedXdr, changedAmountXdr);
    expect(summary.signaturesOnly).toBe(false);
  });

  it("keeps a fee bump's outer and inner layers on separate paths", () => {
    const summary = expectDiff(feeBumpXdr, higherFeeBumpXdr);
    const paths = changedPaths(summary);

    expect(paths).toContain("outer.maxFee");
    // Nothing about the transaction that executes moved.
    expect(paths.some((path) => path.startsWith("inner."))).toBe(false);
  });

  it("compares different envelope kinds without pretending they are the same", () => {
    const summary = expectDiff(baseXdr, feeBumpXdr);

    expect(summary.leftKind).toBe("classic-v1");
    expect(summary.rightKind).toBe("fee-bump");
    expect(summary.identical).toBe(false);

    const envelopeType = summary.entries.find((entry) => entry.path === "envelopeType");
    expect(envelopeType?.status).toBe("changed");
    // Fields that exist only on one side are added or removed, never "changed".
    const outerFee = summary.entries.find((entry) => entry.path === "outer.maxFee");
    expect(outerFee?.status).toBe("added");
    expect(outerFee?.before).toBeNull();
  });

  it("compares a v0 envelope against a v1 one", () => {
    const summary = expectDiff(v0Xdr, baseXdr);

    expect(summary.leftKind).toBe("classic-v0");
    expect(summary.rightKind).toBe("classic-v1");
    expect(changedPaths(summary)).toContain("envelopeType");
  });

  it("attributes an undecodable side to that side", () => {
    expect(diff(notAnEnvelopeXdr, baseXdr)).toEqual({ ok: false, code: "invalid_left_xdr" });
    expect(diff(baseXdr, notAnEnvelopeXdr)).toEqual({ ok: false, code: "invalid_right_xdr" });
  });
});

describe("flattenEnvelope", () => {
  it("carries the canonical XDR of every operation as its own field", () => {
    const map = flattenEnvelope(baseXdr, PASSPHRASE);

    expect(map).not.toBeNull();
    if (!map) return;
    // The catch-all: a field this tool does not model by name still differs here.
    expect(map.get("tx.operations[0].xdr")?.value).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(map.get("tx.operations[1].xdr")).toBeDefined();
  });

  it("labels signatures as their own section", () => {
    const map = flattenEnvelope(signedXdr, PASSPHRASE);

    expect(map?.get("tx.signatures.count")?.section).toBe("signatures");
    expect(map?.get("tx.source")?.section).toBe("body");
    expect(map?.get("tx.operations[0].amount")?.section).toBe("operations");
  });

  it("labels fee-bump layers apart", () => {
    const map = flattenEnvelope(feeBumpXdr, PASSPHRASE);

    expect(map?.get("outer.maxFee")?.layer).toBe("outer");
    expect(map?.get("inner.source")?.layer).toBe("inner");
  });

  it("returns null for something that is not an envelope", () => {
    expect(flattenEnvelope(notAnEnvelopeXdr, PASSPHRASE)).toBeNull();
  });
});

describe("envelopeKind", () => {
  it("names each variant", () => {
    expect(envelopeKind(baseXdr)).toBe("classic-v1");
    expect(envelopeKind(v0Xdr)).toBe("classic-v0");
    expect(envelopeKind(feeBumpXdr)).toBe("fee-bump");
  });

  it("returns null rather than throwing for junk", () => {
    expect(envelopeKind(notAnEnvelopeXdr)).toBeNull();
  });
});

describe("sortKey", () => {
  it("orders index 2 before index 10", () => {
    const paths = ["ops[10].a", "ops[2].a"].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    expect(paths).toEqual(["ops[2].a", "ops[10].a"]);
  });
});

describe("toJsonSummary", () => {
  it("is byte-identical for the same pair of envelopes", () => {
    expect(toJsonSummary(expectDiff(baseXdr, changedAmountXdr))).toBe(
      toJsonSummary(expectDiff(baseXdr, changedAmountXdr))
    );
  });

  it("lists only the changes, with their before and after values", () => {
    const json = JSON.parse(toJsonSummary(expectDiff(baseXdr, changedAmountXdr)));

    expect(json.identical).toBe(false);
    expect(json.changes.length).toBe(json.changedCount);
    const amount = json.changes.find(
      (change: { path: string }) => change.path === "tx.operations[0].amount"
    );
    expect(amount).toMatchObject({
      before: "10.5000000",
      after: "10.6000000",
      status: "changed"
    });
  });

  it("says so plainly when there is nothing to report", () => {
    const json = JSON.parse(toJsonSummary(expectDiff(baseXdr, baseXdr)));
    expect(json).toMatchObject({ identical: true, changedCount: 0, changes: [] });
  });
});

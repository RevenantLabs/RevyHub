import { describe, expect, it } from "vitest";
import {
  buildSourceMap,
  groupBySource,
  toJsonSummary
} from "@/features/operation-source-map/lib/operationSourceMap";
import { parseSourceMapInput } from "@/features/operation-source-map/schema";
import {
  MUXED_ID_ONE,
  allOverriddenXdr,
  feeBumpXdr,
  feeSource,
  mixedOverridesXdr,
  muxedOne,
  muxedTransactionSource,
  muxedTwo,
  muxedXdr,
  noOperationsXdr,
  noOverridesXdr,
  notAnEnvelopeXdr,
  opSourceA,
  opSourceB,
  txSource,
  v0Xdr
} from "@/features/operation-source-map/fixtures/operationSourceMap.fixture";

function map(envelope: string) {
  const parsed = parseSourceMapInput(envelope);
  if (!parsed.ok) throw new Error(`fixture failed to parse: ${parsed.code}`);
  return buildSourceMap(parsed.value);
}

describe("buildSourceMap", () => {
  it("marks inherited and overridden operations apart", () => {
    const result = map(mixedOverridesXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.operations.map((operation) => operation.inherited)).toEqual([
      true,
      false,
      true
    ]);
    expect(result.value.inheritedCount).toBe(2);
    expect(result.value.overriddenCount).toBe(1);
  });

  it("resolves the effective source for every operation", () => {
    const result = map(mixedOverridesXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.operations.map((operation) => operation.effectiveSource.address)).toEqual([
      txSource.publicKey(),
      opSourceA.publicKey(),
      txSource.publicKey()
    ]);
    // An inherited operation declares nothing of its own.
    expect(result.value.operations[0].explicitSource).toBeNull();
    expect(result.value.operations[1].explicitSource?.address).toBe(opSourceA.publicKey());
  });

  it("keeps the operation index and type", () => {
    const result = map(mixedOverridesXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.operations.map((operation) => operation.index)).toEqual([0, 1, 2]);
    expect(result.value.operations.map((operation) => operation.type)).toEqual([
      "payment",
      "payment",
      "bumpSequence"
    ]);
  });

  it("handles an envelope with no overrides at all", () => {
    const result = map(noOverridesXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.overriddenCount).toBe(0);
    expect(result.value.inheritedCount).toBe(2);
    expect(result.value.groups).toHaveLength(1);
    expect(result.value.groups[0].source.address).toBe(txSource.publicKey());
  });

  it("handles an envelope where every operation overrides", () => {
    const result = map(allOverriddenXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.inheritedCount).toBe(0);
    expect(result.value.groups.map((group) => group.source.address)).toEqual([
      opSourceA.publicKey(),
      opSourceB.publicKey()
    ]);
    // The transaction source authorizes nothing here, but is still reported.
    expect(result.value.transactionSource.address).toBe(txSource.publicKey());
  });

  it("uses the inner transaction as the default source in a fee bump", () => {
    const result = map(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.kind).toBe("fee-bump");
    expect(result.value.transactionSource.address).toBe(txSource.publicKey());
    expect(result.value.feePayer?.address).toBe(feeSource.publicKey());
    // The inner operations are mapped, exactly as in the standalone envelope.
    expect(result.value.operations).toHaveLength(3);
  });

  it("never lets the fee payer appear as an operation source", () => {
    const result = map(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const groupAddresses = result.value.groups.map((group) => group.source.address);
    expect(groupAddresses).not.toContain(feeSource.publicKey());
    for (const operation of result.value.operations) {
      expect(operation.effectiveSource.address).not.toBe(feeSource.publicKey());
    }
  });

  it("treats two muxed addresses over one base account as different sources", () => {
    const result = map(muxedXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const groups = result.value.groups.map((group) => group.source.address);
    expect(groups).toContain(muxedOne);
    expect(groups).toContain(muxedTwo);
    expect(muxedOne).not.toBe(muxedTwo);
    // Flattening them to the shared G account would have merged these groups.
    expect(groups).toHaveLength(3);
  });

  it("preserves the exact M address and reports the G account separately", () => {
    const result = map(muxedXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.transactionSource.address).toBe(muxedTransactionSource);
    expect(result.value.transactionSource.baseAddress).toBe(txSource.publicKey());

    const muxedGroup = result.value.groups.find((group) => group.source.address === muxedOne);
    expect(muxedGroup?.source.baseAddress).toBe(opSourceA.publicKey());
    expect(muxedGroup?.source.muxedId).toBe(MUXED_ID_ONE);
  });

  it("maps a v0 envelope", () => {
    const result = map(v0Xdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("classic-v0");
    expect(result.value.transactionSource.address).toBe(txSource.publicKey());
    expect(result.value.operations).toHaveLength(2);
  });

  it("returns an empty map for an envelope with no operations", () => {
    const result = map(noOperationsXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.operations).toEqual([]);
    expect(result.value.groups).toEqual([]);
  });

  it("rejects valid base64 that is not a transaction envelope", () => {
    expect(map(notAnEnvelopeXdr)).toEqual({ ok: false, code: "invalid_xdr" });
  });
});

describe("groupBySource", () => {
  it("orders groups by first appearance, not alphabetically", () => {
    const result = map(allOverriddenXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const groups = groupBySource(result.value.operations);
    expect(groups[0].operationIndexes[0]).toBeLessThan(groups[1].operationIndexes[0]);
  });

  it("counts inherited and overridden separately within a group", () => {
    const result = map(mixedOverridesXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const inherited = result.value.groups.find(
      (group) => group.source.address === txSource.publicKey()
    );
    expect(inherited).toMatchObject({
      operationIndexes: [0, 2],
      inheritedCount: 2,
      overriddenCount: 0
    });
  });
});

describe("toJsonSummary", () => {
  it("is byte-identical for the same envelope", () => {
    const first = map(mixedOverridesXdr);
    const second = map(mixedOverridesXdr);

    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(toJsonSummary(first.value)).toBe(toJsonSummary(second.value));
  });

  it("carries the fee payer without folding it into the groups", () => {
    const result = map(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const summary = JSON.parse(toJsonSummary(result.value));
    expect(summary.feePayer).toBe(feeSource.publicKey());
    expect(summary.groups.map((group: { source: string }) => group.source)).not.toContain(
      feeSource.publicKey()
    );
  });

  it("reports null rather than omitting an absent fee payer", () => {
    const result = map(mixedOverridesXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(JSON.parse(toJsonSummary(result.value)).feePayer).toBeNull();
  });

  it("includes every operation with its origin", () => {
    const result = map(mixedOverridesXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const summary = JSON.parse(toJsonSummary(result.value));
    expect(summary.operations).toHaveLength(3);
    expect(summary.operations[1]).toEqual({
      index: 1,
      type: "payment",
      explicitSource: opSourceA.publicKey(),
      effectiveSource: opSourceA.publicKey(),
      inherited: false
    });
  });
});

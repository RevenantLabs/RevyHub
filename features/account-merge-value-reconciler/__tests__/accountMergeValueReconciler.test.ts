import { describe, expect, it, vi } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { runAccountMergeValueReconciler as run } from "../lib/accountMergeValueReconciler";
import { normalInput, sourceA, sourceB, destination, feeSource, txSource, extension, opSuccess, metaV0 } from "../fixtures/normal.fixture";
import {
  feeBumpInput, missingMetadataInput, conflictingMetadataInput, contradictoryAmountInput, failedInput, mixedInput,
  metaV4Xdr, muxedDestination, payee
} from "../fixtures/boundary.fixture";

describe("account merge reconciliation", () => {
  it("reads both indexed merge amounts and keeps fee, proceeds and unrelated totals apart", () => {
    const result = run(normalInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.evidence).toBe("complete");
    expect(result.value.gaps).toEqual([]);
    expect(result.value.feeStroops).toBe("200");
    expect(result.value.mergeProceedsStroops).toBe("30000003");
    expect(result.value.unrelatedBalanceChangesStroops).toBe("0");
    expect(result.value.transfers.map((transfer) => [transfer.index, transfer.source, transfer.destination, transfer.stroops, transfer.sourceOverride])).toEqual([
      [0, sourceA.publicKey(), destination.publicKey(), "10000001", true],
      [1, sourceB.publicKey(), destination.publicKey(), "20000002", true]
    ]);
  });

  it("keeps a fee-bump payer distinct from the merge sources and inner transaction source", () => {
    const result = run(feeBumpInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.envelopeKind).toBe("fee-bump");
    expect(result.value.feePayer).toBe(feeSource.publicKey());
    expect(result.value.transactionSource).toBe(txSource.publicKey());
    expect(result.value.feeStroops).toBe("500");
    expect(result.value.mergeProceedsStroops).toBe("30000003");
    expect(result.value.transfers.map((transfer) => transfer.source)).toEqual([sourceA.publicKey(), sourceB.publicKey()]);
    expect(result.value.evidence).toBe("complete");
  });

  it("attributes an inherited-source merge to the transaction source and itemises an unrelated payment", () => {
    const result = run(mixedInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.transfers).toHaveLength(1);
    expect(result.value.transfers[0]).toMatchObject({
      index: 0, source: txSource.publicKey(), sourceOverride: false,
      destination: muxedDestination, destinationAccount: destination.publicKey(), stroops: "40000000", status: "success"
    });
    expect(result.value.mergeProceedsStroops).toBe("40000000");
    expect(result.value.unrelatedChanges).toEqual([
      { index: 1, account: sourceB.publicKey(), stroops: "-50000000" },
      { index: 1, account: payee.publicKey(), stroops: "50000000" }
    ]);
    expect(result.value.unrelatedBalanceChangesStroops).toBe("0");
    expect(result.value.evidence).toBe("complete");
  });

  it("marks absent metadata as incomplete without a zero total", () => {
    const result = run(missingMetadataInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.evidence).toBe("incomplete");
    expect(result.value.unrelatedBalanceChangesStroops).toBeNull();
    expect(result.value.metadataVersion).toBe(-1);
    expect(result.value.gaps).toEqual([{ index: null, code: "missing_metadata" }]);
    expect(result.value.mergeProceedsStroops).toBe("30000003");
  });

  it("separates snapshot-less metadata from contradictory metadata", () => {
    const snapshotless = run(conflictingMetadataInput);
    const contradictory = run(contradictoryAmountInput);
    expect(snapshotless.ok && snapshotless.value.gaps).toEqual([{ index: 0, code: "missing_metadata" }, { index: 1, code: "missing_metadata" }]);
    expect(contradictory.ok && contradictory.value.gaps).toEqual([{ index: 0, code: "contradictory_metadata" }]);
    expect(contradictory.ok && contradictory.value.unrelatedBalanceChangesStroops).toBeNull();
  });

  it("reports a failed transaction: rolled-back and failed merges carry no proceeds", () => {
    const result = run(failedInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mergeProceedsStroops).toBe("0");
    expect(result.value.feeStroops).toBe("200");
    expect(result.value.transfers.map((transfer) => [transfer.status, transfer.code, transfer.stroops])).toEqual([
      ["rolled_back", "accountMergeSuccess", null],
      ["failed", "accountMergeHasSubEntries", null]
    ]);
    expect(result.value.gaps).toEqual([{ index: null, code: "transaction_failed" }]);
    expect(result.value.evidence).toBe("incomplete");
  });

  it("reports a transaction that failed before applying operations", () => {
    const resultXdr = new xdr.TransactionResult({
      feeCharged: xdr.Int64.fromString("200"), result: xdr.TransactionResultResult.txBadSeq(), ext: extension()
    }).toXDR("base64");
    const result = run({ ...normalInput, resultXdr, metadataXdr: "" });
    expect(result.ok && result.value.transfers.map((transfer) => [transfer.status, transfer.code])).toEqual([
      ["unavailable", "txBadSeq"], ["unavailable", "txBadSeq"]
    ]);
  });

  it("rejects incompatible envelope/result kinds, counts, operation types and fees", () => {
    expect(run({ ...normalInput, resultXdr: feeBumpInput.resultXdr })).toEqual({ ok: false, code: "incompatible_transaction" });
    expect(run({ ...feeBumpInput, resultXdr: normalInput.resultXdr })).toEqual({ ok: false, code: "incompatible_transaction" });
    expect(run({ ...normalInput, metadataXdr: metaV0([]).toXDR("base64") })).toEqual({ ok: false, code: "incompatible_transaction" });
    expect(run({ ...mixedInput, resultXdr: normalInput.resultXdr })).toEqual({ ok: false, code: "incompatible_transaction" });
    const overCharged = new xdr.TransactionResult({
      feeCharged: xdr.Int64.fromString("201"),
      result: xdr.TransactionResultResult.txSuccess([opSuccess("10000001"), opSuccess("20000002")]), ext: extension()
    }).toXDR("base64");
    expect(run({ ...normalInput, resultXdr: overCharged })).toEqual({ ok: false, code: "incompatible_transaction" });
  });

  it("reports newer protocol arms as unsupported rather than malformed", () => {
    expect(run({ ...normalInput, metadataXdr: metaV4Xdr })).toEqual({ ok: false, code: "unsupported_variant" });
    expect(run({ ...normalInput, envelope: "AAAAAQAAAAA=" })).toEqual({ ok: false, code: "unsupported_variant" });
  });

  it("returns malformed_data for truncated or mistyped XDR", () => {
    expect(run({ ...normalInput, resultXdr: "AAAAAAAAAAA=" })).toEqual({ ok: false, code: "malformed_data" });
    expect(run({ ...normalInput, envelope: normalInput.envelope.slice(0, 40) })).toEqual({ ok: false, code: "malformed_data" });
    expect(run({ ...normalInput, metadataXdr: normalInput.resultXdr })).toEqual({ ok: false, code: "malformed_data" });
  });

  it("performs reconciliation without a request", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    try {
      expect(run(normalInput).ok).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
  });
});

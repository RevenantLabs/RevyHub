import { describe, expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { accountChanges, reconcileValue } from "../lib/value-reconciliation";
import { readEnvelope, mapMergeResults } from "../lib/merge-result-map";
import { accountEntry, normalInput, txSource } from "../fixtures/normal.fixture";
import { conflictingMetadataInput, contradictoryAmountInput } from "../fixtures/boundary.fixture";

function evidence(input = normalInput) {
  const envelope = readEnvelope(xdr.TransactionEnvelope.fromXDR(input.envelope, "base64"));
  if (!envelope.ok) throw Error("fixture envelope");
  const result = mapMergeResults(envelope.value, xdr.TransactionResult.fromXDR(input.resultXdr, "base64"));
  if (!result.ok) throw Error("fixture result");
  return { envelope: envelope.value, result: result.value };
}
const meta = (base64: string) => xdr.TransactionMeta.fromXDR(base64, "base64");
const metaV1 = (txChanges: xdr.LedgerEntryChange[], operations: xdr.OperationMeta[]) =>
  new (xdr.TransactionMeta as unknown as new (v: 1, value: xdr.TransactionMetaV1) => xdr.TransactionMeta)(1, new xdr.TransactionMetaV1({ txChanges, operations }));

describe("account snapshot deltas", () => {
  it("pairs state/updated and state/removed snapshots exactly", () => {
    const observed = accountChanges([
      xdr.LedgerEntryChange.ledgerEntryState(accountEntry(txSource.publicKey(), "9223372036854775807")),
      xdr.LedgerEntryChange.ledgerEntryUpdated(accountEntry(txSource.publicKey(), "1"))
    ]);
    expect(observed.deltas.get(txSource.publicKey())).toBe(1n - 9223372036854775807n);
    expect(observed.incomplete).toBe(false);
  });
  it("flags an update without a prior snapshot as incomplete", () => {
    expect(accountChanges([xdr.LedgerEntryChange.ledgerEntryUpdated(accountEntry(txSource.publicKey(), "5"))]).incomplete).toBe(true);
  });
  it("treats a created account as a delta from zero", () => {
    expect(accountChanges([xdr.LedgerEntryChange.ledgerEntryCreated(accountEntry(txSource.publicKey(), "5"))]).deltas.get(txSource.publicKey())).toBe(5n);
  });
});

describe("operation metadata reconciliation", () => {
  it("checks source removals and destination deltas", () => {
    const { envelope, result } = evidence();
    expect(reconcileValue(result.transfers, envelope.operations.length, meta(normalInput.metadataXdr), false, envelope.feePayer))
      .toMatchObject({ gaps: [], unrelatedBalanceChangesStroops: "0", unrelatedChanges: [], metadataVersion: 0 });
  });

  it("does not turn missing snapshots into a zero", () => {
    const { envelope, result } = evidence();
    expect(reconcileValue(result.transfers, envelope.operations.length, null, false, envelope.feePayer).unrelatedBalanceChangesStroops).toBeNull();
    const snapshotless = reconcileValue(result.transfers, envelope.operations.length, meta(conflictingMetadataInput.metadataXdr), false, envelope.feePayer);
    expect(snapshotless.unrelatedBalanceChangesStroops).toBeNull();
    expect(snapshotless.gaps.every((gap) => gap.code === "missing_metadata")).toBe(true);
  });

  it("flags a destination delta that differs from the result transfer", () => {
    const { envelope, result } = evidence();
    expect(reconcileValue(result.transfers, envelope.operations.length, meta(contradictoryAmountInput.metadataXdr), false, envelope.feePayer).gaps)
      .toEqual([{ index: 0, code: "contradictory_metadata" }]);
  });

  it("keeps fee-payer transaction-level changes out of unrelated totals", () => {
    const { envelope, result } = evidence();
    const operations = meta(normalInput.metadataXdr).operations();
    const refund = metaV1([
      xdr.LedgerEntryChange.ledgerEntryState(accountEntry(txSource.publicKey(), "1000")),
      xdr.LedgerEntryChange.ledgerEntryUpdated(accountEntry(txSource.publicKey(), "1050"))
    ], operations);
    const reconciled = reconcileValue(result.transfers, envelope.operations.length, refund, false, envelope.feePayer);
    expect(reconciled.gaps).toEqual([{ index: null, code: "fee_payer_change" }]);
    expect(reconciled.unrelatedBalanceChangesStroops).toBe("0");
    expect(reconciled.metadataVersion).toBe(1);
  });

  it("ignores a sequence-only transaction-level change to the fee payer", () => {
    const { envelope, result } = evidence();
    const bump = metaV1([
      xdr.LedgerEntryChange.ledgerEntryState(accountEntry(txSource.publicKey(), "1000")),
      xdr.LedgerEntryChange.ledgerEntryUpdated(accountEntry(txSource.publicKey(), "1000"))
    ], meta(normalInput.metadataXdr).operations());
    expect(reconcileValue(result.transfers, envelope.operations.length, bump, false, envelope.feePayer).gaps).toEqual([]);
  });

  it("does not report a merge gap for a failed transaction with empty operation metadata", () => {
    const { envelope, result } = evidence();
    const failed = reconcileValue(result.transfers, envelope.operations.length, metaV1([], []), true, envelope.feePayer);
    expect(failed.gaps).toEqual([{ index: null, code: "transaction_failed" }]);
    expect(failed.unrelatedBalanceChangesStroops).toBeNull();
  });

  it("reports a transaction with no merge", () => {
    expect(reconcileValue([], 0, metaV1([], []), false, txSource.publicKey()).gaps).toEqual([{ index: null, code: "no_merge" }]);
  });
});

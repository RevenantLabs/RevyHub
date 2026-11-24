import { describe, expect, it } from "vitest";
import { Account, MuxedAccount, Networks, Operation, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { readEnvelope, mapMergeResults, baseAccount } from "../lib/merge-result-map";
import { normalInput, destination, extension, opSuccess, sourceA, txSource } from "../fixtures/normal.fixture";
import { feeBumpInput, mixedInput, muxedDestination } from "../fixtures/boundary.fixture";

function envelopeOf(base64: string) {
  const envelope = readEnvelope(xdr.TransactionEnvelope.fromXDR(base64, "base64"));
  if (!envelope.ok) throw Error("fixture envelope");
  return envelope.value;
}
const resultOf = (base64: string) => xdr.TransactionResult.fromXDR(base64, "base64");
const txResult = (fee: string, results: xdr.OperationResult[]) => new xdr.TransactionResult({
  feeCharged: xdr.Int64.fromString(fee), result: xdr.TransactionResultResult.txSuccess(results), ext: extension()
});

describe("merge result mapping", () => {
  it("maps indexed successful merges for classic and fee-bump envelopes", () => {
    for (const input of [normalInput, feeBumpInput]) {
      const mapped = mapMergeResults(envelopeOf(input.envelope), resultOf(input.resultXdr));
      expect(mapped.ok && mapped.value.transfers.map((transfer) => [transfer.index, transfer.stroops])).toEqual([[0, "10000001"], [1, "20000002"]]);
    }
  });

  it("reads the outer fee-bump bid as the fee bound", () => {
    expect(envelopeOf(feeBumpInput.envelope).maxFeeStroops).toBe("1500");
    expect(envelopeOf(normalInput.envelope).maxFeeStroops).toBe("200");
  });

  it("uses the transaction source only when an operation has no override", () => {
    const mapped = mapMergeResults(envelopeOf(mixedInput.envelope), resultOf(mixedInput.resultXdr));
    expect(mapped.ok && mapped.value.transfers[0]).toMatchObject({ source: txSource.publicKey(), sourceOverride: false, index: 0 });
  });

  it("keeps muxed identities and exposes their base accounts", () => {
    const muxedSource = new MuxedAccount(new Account(sourceA.publicKey(), "0"), "18446744073709551615").accountId();
    const tx = new TransactionBuilder(new Account(txSource.publicKey(), "1"), {
      fee: "100", networkPassphrase: Networks.TESTNET, timebounds: { minTime: 0, maxTime: 0 }
    }).addOperation(Operation.accountMerge({ destination: muxedDestination, source: muxedSource })).build();
    const mapped = mapMergeResults(envelopeOf(tx.toXDR()), txResult("100", [opSuccess("1")]));
    expect(mapped.ok && mapped.value.transfers[0]).toMatchObject({
      source: muxedSource, sourceAccount: sourceA.publicKey(),
      destination: muxedDestination, destinationAccount: destination.publicKey(), stroops: "1"
    });
    expect(baseAccount(muxedSource)).toBe(sourceA.publicKey());
    expect(baseAccount(sourceA.publicKey())).toBe(sourceA.publicKey());
  });

  it("accepts the maximum Int64 transfer exactly", () => {
    const mapped = mapMergeResults(envelopeOf(normalInput.envelope), txResult("200", [opSuccess("9223372036854775807"), opSuccess("0")]));
    expect(mapped.ok && mapped.value.transfers.map((transfer) => transfer.stroops)).toEqual(["9223372036854775807", "0"]);
  });

  it("rejects a negative transfer or fee as malformed", () => {
    expect(mapMergeResults(envelopeOf(normalInput.envelope), txResult("200", [opSuccess("-1"), opSuccess("0")])))
      .toEqual({ ok: false, code: "malformed_data" });
    expect(mapMergeResults(envelopeOf(normalInput.envelope), txResult("-1", [opSuccess("1"), opSuccess("0")])))
      .toEqual({ ok: false, code: "malformed_data" });
  });

  it("rejects mismatched kinds, counts and a fee above the bid", () => {
    const envelope = envelopeOf(normalInput.envelope);
    expect(mapMergeResults(envelope, resultOf(feeBumpInput.resultXdr))).toEqual({ ok: false, code: "incompatible_transaction" });
    expect(mapMergeResults(envelope, txResult("200", [opSuccess("1")]))).toEqual({ ok: false, code: "incompatible_transaction" });
    expect(mapMergeResults(envelope, txResult("201", [opSuccess("1"), opSuccess("1")]))).toEqual({ ok: false, code: "incompatible_transaction" });
  });

  it("treats an operation-level failure code as a failed merge", () => {
    const tx = xdr.TransactionResult.fromXDR(new xdr.TransactionResult({
      feeCharged: xdr.Int64.fromString("200"),
      result: xdr.TransactionResultResult.txFailed([xdr.OperationResult.opNoAccount(), opSuccess("5")]),
      ext: extension()
    }).toXDR());
    const mapped = mapMergeResults(envelopeOf(normalInput.envelope), tx);
    expect(mapped.ok && mapped.value.transfers.map((transfer) => [transfer.status, transfer.code])).toEqual([
      ["failed", "opNoAccount"], ["rolled_back", "accountMergeSuccess"]
    ]);
  });
});

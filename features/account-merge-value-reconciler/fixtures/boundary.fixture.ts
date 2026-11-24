import { Account, Keypair, MuxedAccount, Networks, Operation, Asset, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import {
  accountEntry, accountId, destination, extension, feeSource, inner, metaV0, normalInput, opSuccess, sourceA, sourceB, txSource
} from "./normal.fixture";

/* Fee bump: the outer fee payer is distinct from both merge sources. */
const feeBump = TransactionBuilder.buildFeeBumpTransaction(feeSource, "500", inner, Networks.TESTNET);
export const feeBumpEnvelope = feeBump.toXDR();
const innerResult = new xdr.InnerTransactionResult({
  feeCharged: xdr.Int64.fromString("200"),
  result: xdr.InnerTransactionResultResult.txSuccess([opSuccess("10000001"), opSuccess("20000002")]),
  ext: new (xdr.InnerTransactionResultExt as unknown as new (v: 0) => xdr.InnerTransactionResultExt)(0)
});
const pair = new xdr.InnerTransactionResultPair({ transactionHash: Buffer.alloc(32, 7), result: innerResult });
export const feeBumpResultXdr = new xdr.TransactionResult({
  feeCharged: xdr.Int64.fromString("500"), result: xdr.TransactionResultResult.txFeeBumpInnerSuccess(pair), ext: extension()
}).toXDR("base64");
export const feeBumpInput = { ...normalInput, envelope: feeBumpEnvelope, resultXdr: feeBumpResultXdr };

/* Metadata not supplied: an evidence gap, never a zero balance change. */
export const missingMetadataInput = { ...normalInput, metadataXdr: "" };

/* Metadata with the right shape but no account snapshots. */
export const conflictingMetadataInput = { ...normalInput,
  metadataXdr: metaV0([new xdr.OperationMeta({ changes: [] }), new xdr.OperationMeta({ changes: [] })]).toXDR("base64") };

const mergeChanges = (source: string, balance: string, target: string, before: string, after: string): xdr.LedgerEntryChange[] => [
  xdr.LedgerEntryChange.ledgerEntryState(accountEntry(source, balance)),
  xdr.LedgerEntryChange.ledgerEntryRemoved(xdr.LedgerKey.account(new xdr.LedgerKeyAccount({ accountId: accountId(source) }))),
  xdr.LedgerEntryChange.ledgerEntryState(accountEntry(target, before)),
  xdr.LedgerEntryChange.ledgerEntryUpdated(accountEntry(target, after))
];

/* Destination credited by a different amount from the merge result. */
export const contradictoryAmountInput = { ...normalInput, metadataXdr: metaV0([
  new xdr.OperationMeta({ changes: mergeChanges(sourceA.publicKey(), "10000001", destination.publicKey(), "50000000", "60000000") }),
  new xdr.OperationMeta({ changes: mergeChanges(sourceB.publicKey(), "20000002", destination.publicKey(), "60000000", "80000002") })
]).toXDR("base64") };

/* Failed transaction: op 1 reports success but is rolled back, op 2 fails; no operation metadata is recorded. */
const failedMerge = xdr.OperationResult.opInner(xdr.OperationResultTr.accountMerge(xdr.AccountMergeResult.accountMergeHasSubEntries()));
export const failedResultXdr = new xdr.TransactionResult({
  feeCharged: xdr.Int64.fromString("200"),
  result: xdr.TransactionResultResult.txFailed([opSuccess("10000001"), failedMerge]),
  ext: extension()
}).toXDR("base64");
export const failedInput = { ...normalInput, resultXdr: failedResultXdr, metadataXdr: metaV0([]).toXDR("base64") };

/*
 * Mixed: op 1 merges the transaction source itself (no override) into a muxed
 * destination; op 2 is an unrelated payment between other accounts.
 */
export const payee = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 106));
export const muxedDestination = new MuxedAccount(new Account(destination.publicKey(), "0"), "7").accountId();
const mixed = new TransactionBuilder(new Account(txSource.publicKey(), "1"), {
  fee: "100", networkPassphrase: Networks.TESTNET, timebounds: { minTime: 0, maxTime: 0 }
}).addOperation(Operation.accountMerge({ destination: muxedDestination }))
  .addOperation(Operation.payment({ source: sourceB.publicKey(), destination: payee.publicKey(), asset: Asset.native(), amount: "5" }))
  .build();
const paymentSuccess = xdr.OperationResult.opInner(xdr.OperationResultTr.payment(xdr.PaymentResult.paymentSuccess()));
export const mixedInput = {
  envelope: mixed.toXDR(),
  resultXdr: new xdr.TransactionResult({
    feeCharged: xdr.Int64.fromString("200"),
    result: xdr.TransactionResultResult.txSuccess([opSuccess("40000000"), paymentSuccess]),
    ext: extension()
  }).toXDR("base64"),
  metadataXdr: metaV0([
    new xdr.OperationMeta({ changes: mergeChanges(txSource.publicKey(), "40000000", destination.publicKey(), "1000", "40001000") }),
    new xdr.OperationMeta({ changes: [
      xdr.LedgerEntryChange.ledgerEntryState(accountEntry(sourceB.publicKey(), "90000000")),
      xdr.LedgerEntryChange.ledgerEntryUpdated(accountEntry(sourceB.publicKey(), "40000000")),
      xdr.LedgerEntryChange.ledgerEntryState(accountEntry(payee.publicKey(), "10000000")),
      xdr.LedgerEntryChange.ledgerEntryUpdated(accountEntry(payee.publicKey(), "60000000"))
    ] })
  ]).toXDR("base64")
};

/* TransactionMeta v4 header (introduced after the installed SDK). */
export const metaV4Xdr = "AAAABAAAAAA=";
export const invalidEnvelopeInput = { ...normalInput, envelope: "garbage" };
export const destinationAddress = destination.publicKey();

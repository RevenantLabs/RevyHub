import { Account, Keypair, Networks, Operation, TransactionBuilder, StrKey, xdr } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const txSource = seed(101);
export const sourceA = seed(102);
export const sourceB = seed(103);
export const destination = seed(104);
export const feeSource = seed(105);

export const inner = new TransactionBuilder(new Account(txSource.publicKey(), "1"), {
  fee: "100", networkPassphrase: Networks.TESTNET, timebounds: { minTime: 0, maxTime: 0 }
}).addOperation(Operation.accountMerge({ destination: destination.publicKey(), source: sourceA.publicKey() }))
  .addOperation(Operation.accountMerge({ destination: destination.publicKey(), source: sourceB.publicKey() })).build();
export const envelope = inner.toXDR();
export const extension = () => new (xdr.TransactionResultExt as unknown as new (v: 0) => xdr.TransactionResultExt)(0);
export const opSuccess = (balance: string) => xdr.OperationResult.opInner(xdr.OperationResultTr.accountMerge(
  xdr.AccountMergeResult.accountMergeSuccess(xdr.Int64.fromString(balance))
));
export const resultXdr = new xdr.TransactionResult({
  // Two operations at a 100-stroop bid allow at most 200 stroops.
  feeCharged: xdr.Int64.fromString("200"),
  result: xdr.TransactionResultResult.txSuccess([opSuccess("10000001"), opSuccess("20000002")]),
  ext: extension()
}).toXDR("base64");

export const accountId = (publicKey: string) => xdr.PublicKey.publicKeyTypeEd25519(StrKey.decodeEd25519PublicKey(publicKey));
export const accountEntry = (publicKey: string, balance: string) => new xdr.LedgerEntry({
  lastModifiedLedgerSeq: 1,
  data: xdr.LedgerEntryData.account(new xdr.AccountEntry({
    accountId: accountId(publicKey), balance: xdr.Int64.fromString(balance), seqNum: xdr.Int64.fromString("1"),
    numSubEntries: 0, inflationDest: null, flags: 0, homeDomain: "", thresholds: Buffer.from([1, 1, 1, 1]),
    signers: [], ext: new (xdr.AccountEntryExt as unknown as new (v: 0) => xdr.AccountEntryExt)(0)
  })),
  ext: new (xdr.LedgerEntryExt as unknown as new (v: 0) => xdr.LedgerEntryExt)(0)
});
const changes = (source: string, balance: string, before: string, after: string): xdr.LedgerEntryChange[] => [
  xdr.LedgerEntryChange.ledgerEntryState(accountEntry(source, balance)),
  xdr.LedgerEntryChange.ledgerEntryRemoved(xdr.LedgerKey.account(new xdr.LedgerKeyAccount({ accountId: accountId(source) }))),
  xdr.LedgerEntryChange.ledgerEntryState(accountEntry(destination.publicKey(), before)),
  xdr.LedgerEntryChange.ledgerEntryUpdated(accountEntry(destination.publicKey(), after))
];
/** TransactionMeta v0 is a bare OperationMeta array; the SDK types omit its constructor. */
export const metaV0 = (operations: xdr.OperationMeta[]) =>
  new (xdr.TransactionMeta as unknown as new (v: number, operations: xdr.OperationMeta[]) => xdr.TransactionMeta)(0, operations);
export const metadataXdr = metaV0([
  new xdr.OperationMeta({ changes: changes(sourceA.publicKey(), "10000001", "50000000", "60000001") }),
  new xdr.OperationMeta({ changes: changes(sourceB.publicKey(), "20000002", "60000001", "80000003") })
]).toXDR("base64");
export const normalInput = { envelope, resultXdr, metadataXdr };

import { xdr } from "@stellar/stellar-sdk";

/** Convert legacy TransactionV0 to the Transaction form used by its signing payload. */
export function v0SigningTransaction(tx: xdr.TransactionV0): xdr.Transaction {
  const ed25519Discriminant = Buffer.alloc(4); // PUBLIC_KEY_TYPE_ED25519 = 0
  return xdr.Transaction.fromXDR(Buffer.concat([
    ed25519Discriminant,
    tx.toXDR()
  ]));
}

/** Serialize the protocol's TransactionSignaturePayload, including its 4-byte tag. */
export function signatureBase(
  id: Buffer,
  tag: "classic" | "fee-bump",
  transaction: xdr.Transaction | xdr.FeeBumpTransaction
): Buffer {
  const taggedTransaction = tag === "classic"
    ? xdr.TransactionSignaturePayloadTaggedTransaction.envelopeTypeTx(transaction as xdr.Transaction)
    : xdr.TransactionSignaturePayloadTaggedTransaction.envelopeTypeTxFeeBump(transaction as xdr.FeeBumpTransaction);
  return new xdr.TransactionSignaturePayload({
    networkId: xdr.Hash.fromXDR(id),
    taggedTransaction
  }).toXDR();
}

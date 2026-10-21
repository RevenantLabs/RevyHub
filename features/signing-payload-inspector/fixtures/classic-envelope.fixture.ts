import { Account, Asset, Keypair, Networks, Operation, TransactionBuilder, xdr } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const source = seed(41);
export const destination = seed(42);

/** Fixed source, sequence, fee, and operation make the XDR reproducible. */
export const classicTransaction = new TransactionBuilder(new Account(source.publicKey(), "100000000"), {
  fee: "100",
  networkPassphrase: Networks.TESTNET,
  timebounds: { minTime: 0, maxTime: 0 }
}).addOperation(Operation.payment({ destination: destination.publicKey(), asset: Asset.native(), amount: "1.0000001" })).build();
export const classicXdr = classicTransaction.toXDR();

/** The v0 source encoding omits the MuxedAccount discriminant; the rest matches. */
const v1Tx = xdr.TransactionEnvelope.fromXDR(classicXdr, "base64").v1().tx();
const v0Tx = xdr.TransactionV0.fromXDR(v1Tx.toXDR().subarray(4));
export const classicV0Xdr = xdr.TransactionEnvelope.envelopeTypeTxV0(
  new xdr.TransactionV0Envelope({ tx: v0Tx, signatures: [] })
).toXDR("base64");

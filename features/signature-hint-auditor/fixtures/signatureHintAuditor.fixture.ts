import {
  Account,
  Asset,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";
import { hintToHex } from "@/features/signature-hint-auditor/lib/decorated-signatures";

/**
 * Envelopes and keys are built from fixed raw seeds so every address has a
 * correct checksum and every run sees the same bytes.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const source = seed(1);
export const destination = seed(2);
export const feeSource = seed(3);
export const extraSigner = seed(4);
export const unrelatedSigner = seed(5);

export const SEQUENCE = "4370426197114880";

function buildPayment() {
  return new TransactionBuilder(new Account(source.publicKey(), SEQUENCE), {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    timebounds: { minTime: 1_700_000_000, maxTime: 1_900_000_000 }
  })
    .addOperation(
      Operation.payment({
        destination: destination.publicKey(),
        asset: Asset.native(),
        amount: "1"
      })
    )
    .addMemo(Memo.text("hint-audit"))
    .build();
}

/** Classic v1 envelope signed once by the source. */
export const signedClassicXdr = (() => {
  const transaction = buildPayment();
  transaction.sign(source);
  return transaction.toXDR();
})();

/** Same transaction with two decorated signatures (source + extra). */
export const multiSignedClassicXdr = (() => {
  const transaction = buildPayment();
  transaction.sign(source);
  transaction.sign(extraSigner);
  return transaction.toXDR();
})();

/** Unsigned classic envelope — empty signature vector. */
export const unsignedClassicXdr = buildPayment().toXDR();

/** Fee-bump wrapping a signed inner transaction, signed by the fee source. */
export const feeBumpXdr = (() => {
  const inner = buildPayment();
  inner.sign(source);
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "200",
    inner,
    Networks.TESTNET
  );
  feeBump.sign(feeSource);
  return feeBump.toXDR();
})();

/** Unsigned fee-bump — empty outer and empty inner signature vectors. */
export const unsignedFeeBumpXdr = (() => {
  const inner = buildPayment();
  return TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "200",
    inner,
    Networks.TESTNET
  ).toXDR();
})();

/**
 * Classic v0 envelope with one signature.
 *
 * Built by re-wrapping a v1 body so the fixture stays genuinely well-formed.
 */
export const signedV0Xdr = (() => {
  const transaction = buildPayment();
  transaction.sign(source);
  const v1 = xdr.TransactionEnvelope.fromXDR(transaction.toXDR(), "base64").v1();
  const tx = v1.tx();

  const v0Tx = new xdr.TransactionV0({
    sourceAccountEd25519: tx.sourceAccount().ed25519(),
    fee: tx.fee(),
    seqNum: tx.seqNum(),
    timeBounds: tx.cond().timeBounds(),
    memo: tx.memo(),
    operations: tx.operations(),
    ext: xdr.TransactionV0Ext.fromXDR(Buffer.alloc(4), "raw")
  });

  return xdr.TransactionEnvelope.envelopeTypeTxV0(
    new xdr.TransactionV0Envelope({
      tx: v0Tx,
      signatures: v1.signatures()
    })
  ).toXDR("base64");
})();

export const sourceHint = hintToHex(source.signatureHint());
export const extraSignerHint = hintToHex(extraSigner.signatureHint());
export const feeSourceHint = hintToHex(feeSource.signatureHint());

export const notAnEnvelopeXdr = Buffer.alloc(32, 5).toString("base64");
export const notBase64 = "this is definitely not base64!!";
export const secretSeed = source.secret();

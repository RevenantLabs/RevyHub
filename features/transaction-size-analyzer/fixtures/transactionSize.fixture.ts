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

/**
 * Envelopes are built with the SDK from fixed raw seeds rather than hard-coded
 * base64, so every fixture is a genuinely well-formed envelope whose measured
 * size is identical on every machine.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const source = seed(1);
export const destination = seed(2);
export const feeSource = seed(3);
export const cosigner = seed(4);

const SEQUENCE = "4370426197114880";

function builder() {
  return new TransactionBuilder(new Account(source.publicKey(), SEQUENCE), {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    timebounds: { minTime: 0, maxTime: 0 }
  });
}

function payment(amount: string) {
  return Operation.payment({
    destination: destination.publicKey(),
    asset: Asset.native(),
    amount
  });
}

/** One operation, no memo, no signatures — the smallest classic envelope here. */
export const singleOperationTransaction = builder().addOperation(payment("1")).build();
export const singleOperationXdr = singleOperationTransaction.toXDR();

/** Two operations and a short memo. */
export const twoOperationTransaction = builder()
  .addOperation(payment("10.5"))
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .addMemo(Memo.text("Invoice 1001"))
  .build();
export const twoOperationXdr = twoOperationTransaction.toXDR();

/** The same two-operation transaction, signed once. */
export const signedXdr = (() => {
  const transaction = TransactionBuilder.fromXDR(twoOperationXdr, Networks.TESTNET);
  transaction.sign(source);
  return transaction.toXDR();
})();

/** The same transaction again, signed twice. */
export const twiceSignedXdr = (() => {
  const transaction = TransactionBuilder.fromXDR(twoOperationXdr, Networks.TESTNET);
  transaction.sign(source, cosigner);
  return transaction.toXDR();
})();

/** A short memo and a maximum-length memo, to move only the body bytes. */
export const shortMemoXdr = builder()
  .addOperation(payment("1"))
  .addMemo(Memo.text("a"))
  .build()
  .toXDR();

/** 28 bytes is the longest a text memo can be. */
export const LONG_MEMO = "a".repeat(28);
export const longMemoXdr = builder()
  .addOperation(payment("1"))
  .addMemo(Memo.text(LONG_MEMO))
  .build()
  .toXDR();

/** A fee bump wrapping the signed two-operation transaction. */
export const feeBumpXdr = (() => {
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "200",
    TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET) as never,
    Networks.TESTNET
  );
  feeBump.sign(feeSource);
  return feeBump.toXDR();
})();

/** A fee bump whose outer layer is unsigned. */
export const unsignedFeeBumpXdr = TransactionBuilder.buildFeeBumpTransaction(
  feeSource,
  "200",
  TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET) as never,
  Networks.TESTNET
).toXDR();

/**
 * A v0 envelope, re-wrapped at the XDR level from the v1 body because the
 * builder only emits v1 envelopes.
 */
export const v0Xdr = (() => {
  const v1 = xdr.TransactionEnvelope.fromXDR(singleOperationXdr, "base64").v1();
  const tx = v1.tx();

  const v0Tx = new xdr.TransactionV0({
    sourceAccountEd25519: tx.sourceAccount().ed25519(),
    fee: tx.fee(),
    seqNum: tx.seqNum(),
    timeBounds: tx.cond().timeBounds(),
    memo: tx.memo(),
    operations: tx.operations(),
    /*
      The v0 extension union has one arm, discriminant 0, which encodes as four
      zero bytes. It is decoded rather than constructed because the SDK's
      runtime constructor and its published type declaration disagree about the
      arity here, and decoding satisfies both.
    */
    ext: xdr.TransactionV0Ext.fromXDR(Buffer.alloc(4), "raw")
  });

  return xdr.TransactionEnvelope.envelopeTypeTxV0(
    new xdr.TransactionV0Envelope({ tx: v0Tx, signatures: [] })
  ).toXDR("base64");
})();

/** Valid base64 of the right shape that is simply not an envelope. */
export const notAnEnvelopeXdr = Buffer.alloc(32, 5).toString("base64");

export const notBase64 = "this is definitely not base64!!";

/** Used only to prove the seed is refused and never echoed back. */
export const secretSeed = source.secret();

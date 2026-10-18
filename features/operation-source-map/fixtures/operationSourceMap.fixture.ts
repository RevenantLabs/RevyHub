import {
  Account,
  Asset,
  Keypair,
  MuxedAccount,
  Networks,
  Operation,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";

/**
 * Envelopes are built with the SDK from fixed raw seeds rather than hard-coded
 * base64, so every fixture is a genuinely well-formed envelope and every
 * address has a correct checksum.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const txSource = seed(1);
export const destination = seed(2);
export const feeSource = seed(3);
export const opSourceA = seed(4);
export const opSourceB = seed(5);

const SEQUENCE = "4370426197114880";

export const MUXED_ID_ONE = "1";
export const MUXED_ID_TWO = "2";

/** Two muxed addresses over the *same* base account — distinct sources. */
export const muxedOne = new MuxedAccount(
  new Account(opSourceA.publicKey(), "0"),
  MUXED_ID_ONE
).accountId();

export const muxedTwo = new MuxedAccount(
  new Account(opSourceA.publicKey(), "0"),
  MUXED_ID_TWO
).accountId();

function builder(source: Account | MuxedAccount = new Account(txSource.publicKey(), SEQUENCE)) {
  return new TransactionBuilder(source, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    timebounds: { minTime: 0, maxTime: 0 }
  });
}

function payment(amount: string, source?: string) {
  return Operation.payment({
    destination: destination.publicKey(),
    asset: Asset.native(),
    amount,
    ...(source ? { source } : {})
  });
}

/** Operations 1 and 3 inherit; operation 2 overrides. */
export const mixedOverridesTransaction = builder()
  .addOperation(payment("1"))
  .addOperation(payment("2", opSourceA.publicKey()))
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .build();
export const mixedOverridesXdr = mixedOverridesTransaction.toXDR();

/** Nothing overrides — every operation inherits the transaction source. */
export const noOverridesXdr = builder()
  .addOperation(payment("1"))
  .addOperation(payment("2"))
  .build()
  .toXDR();

/** Every operation declares its own source, none of them the transaction source. */
export const allOverriddenXdr = builder()
  .addOperation(payment("1", opSourceA.publicKey()))
  .addOperation(payment("2", opSourceB.publicKey()))
  .build()
  .toXDR();

/**
 * A muxed transaction source, plus two operations sourced from two different
 * muxed addresses that share one base account.
 */
export const muxedXdr = builder(
  new MuxedAccount(new Account(txSource.publicKey(), SEQUENCE), "77")
)
  .addOperation(payment("1"))
  .addOperation(payment("2", muxedOne))
  .addOperation(payment("3", muxedTwo))
  .build()
  .toXDR();

export const muxedTransactionSource = new MuxedAccount(
  new Account(txSource.publicKey(), SEQUENCE),
  "77"
).accountId();

/** A fee bump whose fee source is a third account entirely. */
export const feeBumpXdr = TransactionBuilder.buildFeeBumpTransaction(
  feeSource,
  "200",
  mixedOverridesTransaction,
  Networks.TESTNET
).toXDR();

/**
 * A v1 envelope with an empty operations vector.
 *
 * The builder refuses to produce one, so it is assembled at the XDR level from
 * an existing body — still a well-formed envelope, just an empty map.
 */
export const noOperationsXdr = (() => {
  const v1 = xdr.TransactionEnvelope.fromXDR(noOverridesXdr, "base64").v1();
  const tx = v1.tx();

  const emptyTx = new xdr.Transaction({
    sourceAccount: tx.sourceAccount(),
    fee: tx.fee(),
    seqNum: tx.seqNum(),
    cond: tx.cond(),
    memo: tx.memo(),
    operations: [],
    ext: tx.ext()
  });

  return xdr.TransactionEnvelope.envelopeTypeTx(
    new xdr.TransactionV1Envelope({ tx: emptyTx, signatures: [] })
  ).toXDR("base64");
})();

/**
 * A v0 envelope, re-wrapped at the XDR level from the v1 body because the
 * builder only emits v1 envelopes.
 */
export const v0Xdr = (() => {
  const v1 = xdr.TransactionEnvelope.fromXDR(noOverridesXdr, "base64").v1();
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
export const secretSeed = txSource.secret();

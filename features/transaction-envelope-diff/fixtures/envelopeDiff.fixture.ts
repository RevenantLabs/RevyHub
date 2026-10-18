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
 * Envelopes are built with the SDK from fixed raw seeds, so each pair differs
 * in exactly the one way its name says and in nothing else. That is what lets
 * the tests assert a precise set of changed paths rather than a count.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const source = seed(1);
export const destination = seed(2);
export const feeSource = seed(3);
export const cosigner = seed(4);
export const otherDestination = seed(5);

export const PASSPHRASE = Networks.TESTNET;
const SEQUENCE = "4370426197114880";

function builder() {
  return new TransactionBuilder(new Account(source.publicKey(), SEQUENCE), {
    fee: "100",
    networkPassphrase: PASSPHRASE,
    timebounds: { minTime: 0, maxTime: 0 }
  });
}

function payment(amount: string, to = destination.publicKey()) {
  return Operation.payment({ destination: to, asset: Asset.native(), amount });
}

/** The reference envelope every other fixture is a single edit away from. */
export const baseTransaction = builder()
  .addOperation(payment("10.5"))
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .addMemo(Memo.text("Invoice 1001"))
  .build();
export const baseXdr = baseTransaction.toXDR();

/** Identical bytes, wrapped across lines and padded with spaces. */
export const whitespaceXdr = `  ${baseXdr.slice(0, 30)}\n${baseXdr.slice(30, 60)}\n\t${baseXdr.slice(60)}  `;

/** Exactly one payment amount differs: 10.5 becomes 10.6. */
export const changedAmountXdr = builder()
  .addOperation(payment("10.6"))
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .addMemo(Memo.text("Invoice 1001"))
  .build()
  .toXDR();

/** An amount that only differs past the point a float would keep. */
export const preciseAmountXdr = builder()
  .addOperation(payment("10.5000001"))
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .addMemo(Memo.text("Invoice 1001"))
  .build()
  .toXDR();

/** The same two operations, swapped. */
export const reorderedXdr = builder()
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .addOperation(payment("10.5"))
  .addMemo(Memo.text("Invoice 1001"))
  .build()
  .toXDR();

/** Same body, different destination on the first operation. */
export const changedDestinationXdr = builder()
  .addOperation(payment("10.5", otherDestination.publicKey()))
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .addMemo(Memo.text("Invoice 1001"))
  .build()
  .toXDR();

/** Same body, different memo. */
export const changedMemoXdr = builder()
  .addOperation(payment("10.5"))
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .addMemo(Memo.text("Invoice 1002"))
  .build()
  .toXDR();

/** The base envelope, signed once — body identical, signatures added. */
export const signedXdr = (() => {
  const transaction = TransactionBuilder.fromXDR(baseXdr, PASSPHRASE);
  transaction.sign(source);
  return transaction.toXDR();
})();

/** The base envelope signed by a different key. */
export const differentlySignedXdr = (() => {
  const transaction = TransactionBuilder.fromXDR(baseXdr, PASSPHRASE);
  transaction.sign(cosigner);
  return transaction.toXDR();
})();

/** A third operation appended. */
export const extraOperationXdr = builder()
  .addOperation(payment("10.5"))
  .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
  .addOperation(payment("1"))
  .addMemo(Memo.text("Invoice 1001"))
  .build()
  .toXDR();

/** A fee bump wrapping the signed base envelope. */
export const feeBumpXdr = (() => {
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "200",
    TransactionBuilder.fromXDR(signedXdr, PASSPHRASE) as never,
    PASSPHRASE
  );
  feeBump.sign(feeSource);
  return feeBump.toXDR();
})();

/** The same fee bump at a higher bid — only the outer layer moves. */
export const higherFeeBumpXdr = (() => {
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "300",
    TransactionBuilder.fromXDR(signedXdr, PASSPHRASE) as never,
    PASSPHRASE
  );
  feeBump.sign(feeSource);
  return feeBump.toXDR();
})();

/**
 * A v0 envelope, re-wrapped at the XDR level from the v1 body because the
 * builder only emits v1 envelopes.
 */
export const v0Xdr = (() => {
  const v1 = xdr.TransactionEnvelope.fromXDR(baseXdr, "base64").v1();
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

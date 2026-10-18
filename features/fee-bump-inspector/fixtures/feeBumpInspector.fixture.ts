import {
  Account,
  Asset,
  Keypair,
  Memo,
  MuxedAccount,
  Networks,
  Operation,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";

/**
 * Envelopes are built with the SDK from fixed raw seeds rather than hard-coded
 * base64, so every fixture is a genuinely well-formed envelope, every address
 * has a correct checksum, and every run sees the same bytes.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const innerSource = seed(1);
export const destination = seed(2);
export const feeSource = seed(3);

export const INNER_SEQUENCE = "4370426197114880";
export const MUXED_ID = "1234567890123456789";

/** The muxed form of the fee source, carrying a 64-bit ID the `G…` form cannot express. */
export const muxedFeeSourceAddress = new MuxedAccount(
  new Account(feeSource.publicKey(), "0"),
  MUXED_ID
).accountId();

export const muxedInnerSourceAddress = new MuxedAccount(
  new Account(innerSource.publicKey(), INNER_SEQUENCE),
  MUXED_ID
).accountId();

function innerBuilder(source: Account | MuxedAccount) {
  return new TransactionBuilder(source, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    timebounds: { minTime: 1_700_000_000, maxTime: 1_900_000_000 }
  })
    .addOperation(
      Operation.payment({
        destination: destination.publicKey(),
        asset: Asset.native(),
        amount: "10.5"
      })
    )
    .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
    .addMemo(Memo.text("Invoice 1001"));
}

/** The inner transaction, signed once by its own source. */
export const innerTransaction = (() => {
  const transaction = innerBuilder(new Account(innerSource.publicKey(), INNER_SEQUENCE)).build();
  transaction.sign(innerSource);
  return transaction;
})();

export const innerXdr = innerTransaction.toXDR();

/** An ordinary v1 envelope — correct XDR, but a single layer. */
export const ordinaryXdr = innerXdr;

/** Signed inner transaction, wrapped and signed by the fee source. */
export const feeBumpXdr = (() => {
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "200",
    innerTransaction,
    Networks.TESTNET
  );
  feeBump.sign(feeSource);
  return feeBump.toXDR();
})();

/** Both signature vectors empty — nothing has signed either layer yet. */
export const unsignedFeeBumpXdr = (() => {
  const unsignedInner = innerBuilder(
    new Account(innerSource.publicKey(), INNER_SEQUENCE)
  ).build();

  return TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "200",
    unsignedInner,
    Networks.TESTNET
  ).toXDR();
})();

/** A muxed fee source and a muxed inner source in the same envelope. */
export const muxedFeeBumpXdr = (() => {
  const muxedInner = innerBuilder(
    new MuxedAccount(new Account(innerSource.publicKey(), INNER_SEQUENCE), MUXED_ID)
  ).build();

  return TransactionBuilder.buildFeeBumpTransaction(
    muxedFeeSourceAddress,
    "200",
    muxedInner,
    Networks.TESTNET
  ).toXDR();
})();

/**
 * A fee bid past `Number.MAX_SAFE_INTEGER`.
 *
 * `4e15 × (2 operations + 1)` is 1.2e16 stroops, which a float would round.
 */
export const LARGE_BASE_FEE = "4000000000000000";
export const LARGE_TOTAL_FEE = "12000000000000000";

export const largeFeeBumpXdr = TransactionBuilder.buildFeeBumpTransaction(
  feeSource,
  LARGE_BASE_FEE,
  innerTransaction,
  Networks.TESTNET
).toXDR();

/** The same fee bump, read back on a different network. */
export const OTHER_PASSPHRASE = Networks.PUBLIC;
export const CUSTOM_PASSPHRASE = "Standalone Network ; February 2017";

/**
 * A v0 envelope — also an ordinary transaction, but reached through a
 * different discriminant than v1.
 *
 * The builder only emits v1 envelopes, so this one is re-wrapped at the XDR
 * level from the v1 body. That keeps it a genuinely well-formed v0 envelope
 * rather than hand-written base64.
 */
export const v0Xdr = (() => {
  const v1 = xdr.TransactionEnvelope.fromXDR(innerXdr, "base64").v1();
  const tx = v1.tx();

  const v0Tx = new xdr.TransactionV0({
    sourceAccountEd25519: tx.sourceAccount().ed25519(),
    fee: tx.fee(),
    seqNum: tx.seqNum(),
    timeBounds: tx.cond().timeBounds(),
    memo: tx.memo(),
    operations: tx.operations(),
    /*
      The v0 extension is a union whose only arm is discriminant 0, which
      encodes as four zero bytes. It is decoded rather than constructed
      because the SDK's runtime constructor and its published type
      declaration disagree about the arity here, and decoding is the form
      that satisfies both.
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
export const secretSeed = innerSource.secret();

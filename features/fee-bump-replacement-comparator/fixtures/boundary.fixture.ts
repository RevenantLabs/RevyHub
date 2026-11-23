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
import {
  INNER_SEQUENCE,
  PASSPHRASE,
  destination,
  feeSource,
  innerSource,
  otherInnerSource
} from "@/features/fee-bump-replacement-comparator/fixtures/normal.fixture";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
const spare = seed(7);

/**
 * Adverse and incomplete-evidence cases from the acceptance criteria:
 * changed inner source/sequence, lower outer fee, ordinary envelopes,
 * malformed bytes, and secret seeds.
 */

function buildInner(sourceKey: Keypair, sequence: string) {
  const transaction = new TransactionBuilder(new Account(sourceKey.publicKey(), sequence), {
    fee: "100",
    networkPassphrase: PASSPHRASE,
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
    .addMemo(Memo.text("Invoice 1001"))
    .build();
  transaction.sign(sourceKey);
  return transaction;
}

const baselineInner = buildInner(innerSource, INNER_SEQUENCE);

function wrap(fee: string, inner = baselineInner, feePayer = feeSource) {
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    feePayer,
    fee,
    inner,
    PASSPHRASE
  );
  feeBump.sign(feePayer);
  return feeBump.toXDR();
}

/** Lower outer fee than the baseline 200-stroop-per-op wrapper (600 total). */
export const lowerFeeBumpXdr = wrap("100");

/** Same fee terms but a different inner source account. */
export const changedInnerSourceXdr = wrap(
  "200",
  buildInner(otherInnerSource, INNER_SEQUENCE)
);

/** Same source but a different sequence number. */
export const changedInnerSequenceXdr = wrap(
  "200",
  buildInner(innerSource, "4370426197115000")
);

/** Ordinary v1 envelope — correct XDR, wrong tool. */
export const ordinaryXdr = baselineInner.toXDR();

/**
 * A v0 envelope — also an ordinary transaction, reached through a different
 * discriminant than v1.
 */
export const v0Xdr = (() => {
  const v1 = xdr.TransactionEnvelope.fromXDR(ordinaryXdr, "base64").v1();
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
    new xdr.TransactionV0Envelope({ tx: v0Tx, signatures: [] })
  ).toXDR("base64");
})();

/** Valid base64 of the right shape that is simply not an envelope. */
export const notAnEnvelopeXdr = Buffer.alloc(32, 5).toString("base64");

export const notBase64 = "this is definitely not base64!!";

/** Used only to prove the seed is refused and never echoed back. */
export const secretSeed = spare.secret();

export { Networks };

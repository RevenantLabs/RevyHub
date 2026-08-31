import {
  Account,
  Asset,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder
} from "@stellar/stellar-sdk";

/**
 * Envelopes are built with the SDK from fixed seeds rather than hard-coded
 * base64, so every fixture is a genuinely well-formed envelope and every run
 * sees the same bytes.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const source = seed(1);
export const destination = seed(2);
export const feeSource = seed(3);

const MIN_TIME = 1_700_000_000;
const MAX_TIME = 1_900_000_000;
/** Already in the past, for the expired-bounds path. */
const PAST_MAX_TIME = 1_600_000_000;

function builder(timebounds: { minTime: number; maxTime: number }) {
  return new TransactionBuilder(new Account(source.publicKey(), "4370426197114880"), {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    timebounds
  });
}

/** A v1 envelope with a text memo, two operations and no signatures. */
export const paymentEnvelope = builder({ minTime: MIN_TIME, maxTime: MAX_TIME })
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

export const paymentXdr = paymentEnvelope.toXDR();

/** The same transaction, signed once. */
export const signedPaymentXdr = (() => {
  const tx = TransactionBuilder.fromXDR(paymentXdr, Networks.TESTNET);
  tx.sign(source);
  return tx.toXDR();
})();

/** No time bounds at all — the "valid indefinitely" path. */
export const unboundedXdr = new TransactionBuilder(
  new Account(source.publicKey(), "4370426197114880"),
  { fee: "100", networkPassphrase: Networks.TESTNET, timebounds: { minTime: 0, maxTime: 0 } }
)
  .addOperation(Operation.payment({
    destination: destination.publicKey(),
    asset: Asset.native(),
    amount: "1"
  }))
  .build()
  .toXDR();

/** Upper bound already passed. */
export const expiredXdr = builder({ minTime: MIN_TIME, maxTime: PAST_MAX_TIME })
  .addOperation(Operation.payment({
    destination: destination.publicKey(),
    asset: Asset.native(),
    amount: "1"
  }))
  .build()
  .toXDR();

/** A fee bump wrapping the signed payment. */
export const feeBumpXdr = TransactionBuilder.buildFeeBumpTransaction(
  feeSource,
  "200",
  TransactionBuilder.fromXDR(signedPaymentXdr, Networks.TESTNET) as never,
  Networks.TESTNET
).toXDR();

/** Valid base64 of the right shape that is simply not an envelope. */
export const notAnEnvelopeXdr = Buffer.alloc(32, 5).toString("base64");

export const notBase64 = "this is definitely not base64!!";

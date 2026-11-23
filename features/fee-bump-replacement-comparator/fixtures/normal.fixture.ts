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
 * Deterministic fee-bump pairs built with the SDK from fixed raw seeds.
 * Every fixture is a genuinely well-formed envelope with correct checksums.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const innerSource = seed(1);
export const destination = seed(2);
export const feeSource = seed(3);
export const otherFeeSource = seed(4);
export const cosigner = seed(5);
export const otherInnerSource = seed(6);

export const PASSPHRASE = Networks.TESTNET;
export const OTHER_PASSPHRASE = Networks.PUBLIC;
export const CUSTOM_PASSPHRASE = "Standalone Network ; February 2017";

export const INNER_SEQUENCE = "4370426197114880";

function innerBuilder(sourceKey = innerSource, sequence = INNER_SEQUENCE) {
  return new TransactionBuilder(new Account(sourceKey.publicKey(), sequence), {
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
    .addMemo(Memo.text("Invoice 1001"));
}

/** Signed inner transaction shared by the normal fee-bump pair. */
export const innerTransaction = (() => {
  const transaction = innerBuilder().build();
  transaction.sign(innerSource);
  return transaction;
})();

function wrap(fee: string, feePayer = feeSource, inner = innerTransaction) {
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    feePayer,
    fee,
    inner,
    PASSPHRASE
  );
  feeBump.sign(feePayer);
  return feeBump;
}

/** Baseline fee bump — the "current" envelope in a replacement pair. */
export const currentFeeBumpXdr = wrap("200").toXDR();

/** Higher outer fee, same inner — a valid replacement candidate. */
export const higherFeeBumpXdr = wrap("300").toXDR();

/** Same inner and same outer fee, different fee-source account. */
export const otherFeeSourceXdr = wrap("200", otherFeeSource).toXDR();

/**
 * Same inner body, different inner signatures only.
 *
 * The inner hash must still match the baseline because signatures are not
 * part of the signature base.
 */
export const differentlySignedInnerXdr = (() => {
  const transaction = innerBuilder().build();
  transaction.sign(cosigner);
  return wrap("250", feeSource, transaction).toXDR();
})();

/** Whitespace-wrapped copy of the current envelope. */
export const whitespaceCurrentXdr = `  ${currentFeeBumpXdr.slice(0, 40)}\n${currentFeeBumpXdr.slice(40, 80)}\n\t${currentFeeBumpXdr.slice(80)}  `;

/** A fee past Number.MAX_SAFE_INTEGER so float formatting would round. */
export const LARGE_BASE_FEE = "4000000000000000";
export const LARGE_TOTAL_FEE = "12000000000000000";

export const largeFeeBumpXdr = TransactionBuilder.buildFeeBumpTransaction(
  feeSource,
  LARGE_BASE_FEE,
  innerTransaction,
  PASSPHRASE
).toXDR();

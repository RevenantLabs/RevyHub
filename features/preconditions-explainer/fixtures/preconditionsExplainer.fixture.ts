import {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder
} from "@stellar/stellar-sdk";
import type { LedgerSnapshot } from "@/features/preconditions-explainer/types";

/**
 * Every address and envelope here is derived from a fixed raw seed and built
 * with the SDK, so the checksums are real and the bytes are identical on every
 * machine. Nothing is hand-typed.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const source = seed(41);
export const destination = seed(42);
export const extraSigner = seed(43);
export const feeSource = seed(44);

/** Used only to prove a secret is rejected; never rendered or transmitted. */
export const secretSeed = seed(45).secret();

export const currentLedgerSequence = 1_400_000;
export const currentLedgerClosedAt = "2026-05-02T10:14:05.000Z";
export const currentLedgerClosedAtUnix = Math.floor(Date.parse(currentLedgerClosedAt) / 1000);

const HOUR = 3_600;
const DAY = 86_400;

export const ledgerSnapshot: LedgerSnapshot = {
  sequence: currentLedgerSequence,
  closedAt: currentLedgerClosedAt,
  closedAtUnix: String(currentLedgerClosedAtUnix)
};

export const openMinTime = currentLedgerClosedAtUnix - HOUR;
export const openMaxTime = currentLedgerClosedAtUnix + 2 * HOUR;
export const openMinLedger = currentLedgerSequence - 1_000;
export const openMaxLedger = currentLedgerSequence + 5_000;
export const minAccountSequence = "4370426197100000";
export const minAccountSequenceAge = 300;
export const minAccountSequenceLedgerGap = 60;

const accountSequence = "4370426197114880";

function payment() {
  return Operation.payment({
    destination: destination.publicKey(),
    asset: Asset.native(),
    amount: "10.5"
  });
}

interface BuildOptions {
  timebounds: { minTime: number; maxTime: number };
  ledgerbounds?: { minLedger: number; maxLedger: number };
  minAccountSequence?: string;
  minAccountSequenceAge?: number;
  minAccountSequenceLedgerGap?: number;
  extraSigners?: string[];
}

function build(options: BuildOptions) {
  return new TransactionBuilder(new Account(source.publicKey(), accountSequence), {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    ...options
  })
    .addOperation(payment())
    .build();
}

/** Every precondition set, all of them currently open against the snapshot. */
export const openTransaction = build({
  timebounds: { minTime: openMinTime, maxTime: openMaxTime },
  ledgerbounds: { minLedger: openMinLedger, maxLedger: openMaxLedger },
  minAccountSequence,
  minAccountSequenceAge,
  minAccountSequenceLedgerGap,
  extraSigners: [extraSigner.publicKey()]
});

export const openXdr = openTransaction.toXDR();

/** The upper time bound is already behind the snapshot's close time. */
export const expiredXdr = build({
  timebounds: {
    minTime: currentLedgerClosedAtUnix - DAY,
    maxTime: currentLedgerClosedAtUnix - HOUR
  }
}).toXDR();

/** Both lower bounds are still ahead of the snapshot. */
export const notYetValidXdr = build({
  timebounds: { minTime: currentLedgerClosedAtUnix + DAY, maxTime: 0 },
  ledgerbounds: { minLedger: currentLedgerSequence + 500, maxLedger: 0 }
}).toXDR();

/** Ledger bounds only — the case that cannot be judged without a snapshot. */
export const ledgerBoundsOnlyXdr = build({
  timebounds: { minTime: 0, maxTime: 0 },
  ledgerbounds: { minLedger: openMinLedger, maxLedger: openMaxLedger }
}).toXDR();

/** No preconditions at all: the "valid indefinitely" case. */
export const unconditionalXdr = build({ timebounds: { minTime: 0, maxTime: 0 } }).toXDR();

/** A fee bump wrapping the signed open transaction. */
export const feeBumpXdr = (() => {
  const inner = TransactionBuilder.fromXDR(openXdr, Networks.TESTNET);
  inner.sign(source);
  return TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "200",
    inner as never,
    Networks.TESTNET
  ).toXDR();
})();

/** Valid base64 of a legal length that simply is not an envelope. */
export const notAnEnvelopeXdr = Buffer.alloc(32, 7).toString("base64");

export const notBase64 = "this is definitely not base64!!";

export const ledgerPage = {
  _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
  _embedded: {
    records: [
      {
        id: "abc",
        paging_token: String(currentLedgerSequence),
        hash: "a".repeat(64),
        sequence: currentLedgerSequence,
        closed_at: currentLedgerClosedAt,
        successful_transaction_count: 12,
        failed_transaction_count: 1,
        operation_count: 20,
        base_fee_in_stroops: 100,
        base_reserve_in_stroops: 5_000_000,
        max_tx_set_size: 1_000,
        protocol_version: 22
      }
    ]
  }
};

export const emptyLedgerPage = {
  _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
  _embedded: { records: [] }
};

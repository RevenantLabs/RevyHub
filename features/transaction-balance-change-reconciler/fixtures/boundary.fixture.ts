import { xdr } from "@stellar/stellar-sdk";
import {
  destination,
  encodeMeta,
  encodeResult,
  makeAccountEntry,
  makeTrustlineEntry,
  normalPayment,
  issuer,
  source,
  PASSPHRASE
} from "@/features/transaction-balance-change-reconciler/fixtures/normal.fixture";

/**
 * Adverse / incomplete-evidence cases from the acceptance criteria.
 * Each fixture is one concrete gap — missing fee, unpaired removal, or a
 * residual that cannot close.
 */

/** Metadata and envelope present, but result fee does not match observed deltas. */
export const unexplainedResidual = (() => {
  // Same balance changes as a 10 XLM payment + 100 stroop fee, but result claims fee 1.
  // Native sum = -100000100; expected from fee = -1; residual huge.
  return {
    ...normalPayment,
    resultXdr: encodeResult("1")
  };
})();

/** Removal without a preceding state — before balance unknown. */
export const unpairedRemoval = (() => {
  const feeBefore = makeAccountEntry(source, "1000000100", "4370426197114880");
  const feeAfter = makeAccountEntry(source, "1000000000", "4370426197114880");
  const trust = makeTrustlineEntry(destination, "USDC", issuer, "50000000");
  const removedKey = xdr.LedgerKey.trustline(
    new xdr.LedgerKeyTrustLine({
      accountId: trust.data().trustLine().accountId(),
      asset: trust.data().trustLine().asset()
    })
  );

  return {
    envelopeXdr: normalPayment.envelopeXdr,
    resultXdr: encodeResult("100"),
    metaXdr: encodeMeta(2, {
      txBefore: [
        xdr.LedgerEntryChange.ledgerEntryState(feeBefore),
        xdr.LedgerEntryChange.ledgerEntryUpdated(feeAfter)
      ],
      operations: [
        new xdr.OperationMeta({
          changes: [xdr.LedgerEntryChange.ledgerEntryRemoved(removedKey)]
        })
      ]
    }),
    networkPassphrase: PASSPHRASE
  };
})();

/** Account entry removed with a prior state — creation/removal coverage. */
export const accountRemoved = (() => {
  const feeBefore = makeAccountEntry(source, "1000000100", "4370426197114880");
  const feeAfter = makeAccountEntry(source, "1000000000", "4370426197114880");
  const before = makeAccountEntry(destination, "25000000", "1");
  const removedKey = xdr.LedgerKey.account(
    new xdr.LedgerKeyAccount({ accountId: before.data().account().accountId() })
  );

  return {
    envelopeXdr: normalPayment.envelopeXdr,
    resultXdr: encodeResult("100"),
    metaXdr: encodeMeta(2, {
      txBefore: [
        xdr.LedgerEntryChange.ledgerEntryState(feeBefore),
        xdr.LedgerEntryChange.ledgerEntryUpdated(feeAfter)
      ],
      operations: [
        new xdr.OperationMeta({
          changes: [
            xdr.LedgerEntryChange.ledgerEntryState(before),
            xdr.LedgerEntryChange.ledgerEntryRemoved(removedKey)
          ]
        })
      ]
    }),
    networkPassphrase: PASSPHRASE
  };
})();

/** Only a data entry changes — no balance evidence at all besides the fee. */
export const nonBalanceOnly = (() => {
  const feeBefore = makeAccountEntry(source, "1000000100", "4370426197114880");
  const feeAfter = makeAccountEntry(source, "1000000000", "4370426197114880");
  const dataEntry = new xdr.LedgerEntry({
    lastModifiedLedgerSeq: 10,
    data: xdr.LedgerEntryData.data(
      new xdr.DataEntry({
        accountId: feeBefore.data().account().accountId(),
        dataName: "note",
        dataValue: Buffer.from("hi"),
        ext: new (xdr.DataEntryExt as unknown as new (v: 0) => xdr.DataEntryExt)(0)
      })
    ),
    ext: new (xdr.LedgerEntryExt as unknown as new (v: 0) => xdr.LedgerEntryExt)(0)
  });

  return {
    envelopeXdr: normalPayment.envelopeXdr,
    resultXdr: encodeResult("100"),
    metaXdr: encodeMeta(1, {
      txBefore: [
        xdr.LedgerEntryChange.ledgerEntryState(feeBefore),
        xdr.LedgerEntryChange.ledgerEntryUpdated(feeAfter)
      ],
      operations: [
        new xdr.OperationMeta({
          changes: [
            xdr.LedgerEntryChange.ledgerEntryState(dataEntry),
            xdr.LedgerEntryChange.ledgerEntryUpdated(dataEntry)
          ]
        })
      ]
    }),
    networkPassphrase: PASSPHRASE
  };
})();

/** Oversized blob for schema rejection. */
export const tooLargeXdr = "A".repeat(65_537);

import {
  Account,
  Asset,
  FeeBumpTransaction,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";

/**
 * Deterministic XDR fixtures built from fixed raw seeds. Every amount is an
 * integer stroop string so tests can assert exact deltas and residuals.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const source = seed(1);
export const destination = seed(2);
export const issuer = seed(3);
export const feeSource = seed(4);
export const other = seed(5);

export const PASSPHRASE = Networks.TESTNET;
const SEQUENCE = "4370426197114880";

function accountId(kp: Keypair): xdr.PublicKey {
  return xdr.PublicKey.publicKeyTypeEd25519(kp.rawPublicKey());
}

function emptyAccountExt(): xdr.AccountEntryExt {
  return new (xdr.AccountEntryExt as unknown as new (v: 0) => xdr.AccountEntryExt)(0);
}

function emptyLedgerExt(): xdr.LedgerEntryExt {
  return new (xdr.LedgerEntryExt as unknown as new (v: 0) => xdr.LedgerEntryExt)(0);
}

function emptyTrustExt(): xdr.TrustLineEntryExt {
  return new (xdr.TrustLineEntryExt as unknown as new (v: 0) => xdr.TrustLineEntryExt)(0);
}

function emptyResultExt(): xdr.TransactionResultExt {
  return new (xdr.TransactionResultExt as unknown as new (v: 0) => xdr.TransactionResultExt)(0);
}

export function makeAccountEntry(
  kp: Keypair,
  balanceStroops: string,
  seq = "1"
): xdr.LedgerEntry {
  return new xdr.LedgerEntry({
    lastModifiedLedgerSeq: 10,
    data: xdr.LedgerEntryData.account(
      new xdr.AccountEntry({
        accountId: accountId(kp),
        balance: xdr.Int64.fromString(balanceStroops),
        seqNum: xdr.SequenceNumber.fromString(seq),
        numSubEntries: 0,
        inflationDest: null,
        flags: 0,
        homeDomain: "",
        thresholds: Buffer.from([1, 0, 0, 0]),
        signers: [],
        ext: emptyAccountExt()
      })
    ),
    ext: emptyLedgerExt()
  });
}

export function makeTrustlineEntry(
  kp: Keypair,
  code: string,
  issuerKp: Keypair,
  balanceStroops: string
): xdr.LedgerEntry {
  const asset = new Asset(code, issuerKp.publicKey());
  return new xdr.LedgerEntry({
    lastModifiedLedgerSeq: 10,
    data: xdr.LedgerEntryData.trustline(
      new xdr.TrustLineEntry({
        accountId: accountId(kp),
        asset: asset.toTrustLineXDRObject(),
        balance: xdr.Int64.fromString(balanceStroops),
        limit: xdr.Int64.fromString("9223372036854775807"),
        flags: 1,
        ext: emptyTrustExt()
      })
    ),
    ext: emptyLedgerExt()
  });
}

export function encodeMeta(
  variant: 0 | 1 | 2 | 3,
  parts: {
    txBefore?: xdr.LedgerEntryChange[];
    operations?: xdr.OperationMeta[];
    txAfter?: xdr.LedgerEntryChange[];
  }
): string {
  const operations = parts.operations ?? [];
  const txBefore = parts.txBefore ?? [];
  const txAfter = parts.txAfter ?? [];

  if (variant === 0) {
    return new xdr.TransactionMeta(0, operations).toXDR("base64");
  }
  if (variant === 1) {
    return new xdr.TransactionMeta(
      1,
      new xdr.TransactionMetaV1({ txChanges: txBefore, operations })
    ).toXDR("base64");
  }
  if (variant === 2) {
    return new xdr.TransactionMeta(
      2,
      new xdr.TransactionMetaV2({
        txChangesBefore: txBefore,
        operations,
        txChangesAfter: txAfter
      })
    ).toXDR("base64");
  }

  return new xdr.TransactionMeta(
    3,
    new xdr.TransactionMetaV3({
      ext: new xdr.ExtensionPoint(0),
      txChangesBefore: txBefore,
      operations,
      txChangesAfter: txAfter,
      sorobanMeta: null
    })
  ).toXDR("base64");
}

export function encodeResult(feeCharged: string): string {
  return new xdr.TransactionResult({
    feeCharged: xdr.Int64.fromString(feeCharged),
    result: xdr.TransactionResultResult.txSuccess([]),
    ext: emptyResultExt()
  }).toXDR("base64");
}

function paymentEnvelope(): string {
  return new TransactionBuilder(new Account(source.publicKey(), SEQUENCE), {
    fee: "100",
    networkPassphrase: PASSPHRASE,
    timebounds: { minTime: 0, maxTime: 0 }
  })
    .addOperation(
      Operation.payment({
        destination: destination.publicKey(),
        asset: Asset.native(),
        amount: "10"
      })
    )
    .build()
    .toXDR();
}

function feeBumpEnvelope(): string {
  const inner = TransactionBuilder.fromXDR(paymentEnvelope(), PASSPHRASE);
  inner.sign(source);
  const bump = TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    "200",
    inner as never,
    PASSPHRASE
  );
  bump.sign(feeSource);
  return bump.toXDR();
}

/** Classic payment: source −10 XLM, dest +10 XLM, fee 100 stroops on source. */
export const normalPayment = (() => {
  const feeBefore = makeAccountEntry(source, "1000000100", SEQUENCE);
  const feeAfter = makeAccountEntry(source, "1000000000", SEQUENCE);
  const sourceBefore = makeAccountEntry(source, "1000000000", SEQUENCE);
  const sourceAfter = makeAccountEntry(source, "900000000", "4370426197114881");
  const destBefore = makeAccountEntry(destination, "0", "1");
  const destAfter = makeAccountEntry(destination, "100000000", "1");

  const metaXdr = encodeMeta(2, {
    txBefore: [
      xdr.LedgerEntryChange.ledgerEntryState(feeBefore),
      xdr.LedgerEntryChange.ledgerEntryUpdated(feeAfter)
    ],
    operations: [
      new xdr.OperationMeta({
        changes: [
          xdr.LedgerEntryChange.ledgerEntryState(sourceBefore),
          xdr.LedgerEntryChange.ledgerEntryUpdated(sourceAfter),
          xdr.LedgerEntryChange.ledgerEntryState(destBefore),
          xdr.LedgerEntryChange.ledgerEntryUpdated(destAfter)
        ]
      })
    ]
  });

  return {
    envelopeXdr: paymentEnvelope(),
    resultXdr: encodeResult("100"),
    metaXdr,
    networkPassphrase: PASSPHRASE,
    feeCharged: "100",
    feeSource: source.publicKey()
  };
})();

/** Trustline credit transfer with issuer identity retained. */
export const normalTrustline = (() => {
  const feeBefore = makeAccountEntry(source, "1000000100", SEQUENCE);
  const feeAfter = makeAccountEntry(source, "1000000000", SEQUENCE);
  const srcBefore = makeTrustlineEntry(source, "USDC", issuer, "500000000");
  const srcAfter = makeTrustlineEntry(source, "USDC", issuer, "400000000");
  const dstBefore = makeTrustlineEntry(destination, "USDC", issuer, "100000000");
  const dstAfter = makeTrustlineEntry(destination, "USDC", issuer, "200000000");

  const envelopeXdr = new TransactionBuilder(new Account(source.publicKey(), SEQUENCE), {
    fee: "100",
    networkPassphrase: PASSPHRASE,
    timebounds: { minTime: 0, maxTime: 0 }
  })
    .addOperation(
      Operation.payment({
        destination: destination.publicKey(),
        asset: new Asset("USDC", issuer.publicKey()),
        amount: "10"
      })
    )
    .build()
    .toXDR();

  return {
    envelopeXdr,
    resultXdr: encodeResult("100"),
    metaXdr: encodeMeta(2, {
      txBefore: [
        xdr.LedgerEntryChange.ledgerEntryState(feeBefore),
        xdr.LedgerEntryChange.ledgerEntryUpdated(feeAfter)
      ],
      operations: [
        new xdr.OperationMeta({
          changes: [
            xdr.LedgerEntryChange.ledgerEntryState(srcBefore),
            xdr.LedgerEntryChange.ledgerEntryUpdated(srcAfter),
            xdr.LedgerEntryChange.ledgerEntryState(dstBefore),
            xdr.LedgerEntryChange.ledgerEntryUpdated(dstAfter)
          ]
        })
      ]
    }),
    networkPassphrase: PASSPHRASE,
    assetCode: "USDC",
    issuer: issuer.publicKey()
  };
})();

/** Fee-bump: outer fee source pays the fee; inner source pays the transfer. */
export const feeSponsoredPayment = (() => {
  const feeBefore = makeAccountEntry(feeSource, "5000000", "1");
  const feeAfter = makeAccountEntry(feeSource, "4999800", "1");
  const sourceBefore = makeAccountEntry(source, "1000000000", SEQUENCE);
  const sourceAfter = makeAccountEntry(source, "900000000", "4370426197114881");
  const destBefore = makeAccountEntry(destination, "0", "1");
  const destAfter = makeAccountEntry(destination, "100000000", "1");

  return {
    envelopeXdr: feeBumpEnvelope(),
    resultXdr: encodeResult("200"),
    metaXdr: encodeMeta(2, {
      txBefore: [
        xdr.LedgerEntryChange.ledgerEntryState(feeBefore),
        xdr.LedgerEntryChange.ledgerEntryUpdated(feeAfter)
      ],
      operations: [
        new xdr.OperationMeta({
          changes: [
            xdr.LedgerEntryChange.ledgerEntryState(sourceBefore),
            xdr.LedgerEntryChange.ledgerEntryUpdated(sourceAfter),
            xdr.LedgerEntryChange.ledgerEntryState(destBefore),
            xdr.LedgerEntryChange.ledgerEntryUpdated(destAfter)
          ]
        })
      ]
    }),
    networkPassphrase: PASSPHRASE,
    feeSource: feeSource.publicKey(),
    innerSource: source.publicKey()
  };
})();

/** Trustline created with zero balance, then funded — creation + update. */
export const trustlineCreated = (() => {
  const feeBefore = makeAccountEntry(source, "1000000100", SEQUENCE);
  const feeAfter = makeAccountEntry(source, "1000000000", SEQUENCE);
  const created = makeTrustlineEntry(destination, "EUR", issuer, "0");
  const funded = makeTrustlineEntry(destination, "EUR", issuer, "25000000");

  return {
    envelopeXdr: paymentEnvelope(),
    resultXdr: encodeResult("100"),
    metaXdr: encodeMeta(1, {
      txBefore: [
        xdr.LedgerEntryChange.ledgerEntryState(feeBefore),
        xdr.LedgerEntryChange.ledgerEntryUpdated(feeAfter)
      ],
      operations: [
        new xdr.OperationMeta({
          changes: [
            xdr.LedgerEntryChange.ledgerEntryCreated(created),
            xdr.LedgerEntryChange.ledgerEntryState(created),
            xdr.LedgerEntryChange.ledgerEntryUpdated(funded)
          ]
        })
      ]
    }),
    networkPassphrase: PASSPHRASE
  };
})();

/** Same account key touched twice (fee then payment) — net delta must sum. */
export const repeatedKeyChanges = (() => {
  const feeBefore = makeAccountEntry(source, "1100000100", SEQUENCE);
  const feeAfter = makeAccountEntry(source, "1100000000", SEQUENCE);
  const payBefore = makeAccountEntry(source, "1100000000", SEQUENCE);
  const payAfter = makeAccountEntry(source, "1000000000", "4370426197114881");
  const destBefore = makeAccountEntry(destination, "0", "1");
  const destAfter = makeAccountEntry(destination, "100000000", "1");

  return {
    envelopeXdr: paymentEnvelope(),
    resultXdr: encodeResult("100"),
    metaXdr: encodeMeta(2, {
      txBefore: [
        xdr.LedgerEntryChange.ledgerEntryState(feeBefore),
        xdr.LedgerEntryChange.ledgerEntryUpdated(feeAfter)
      ],
      operations: [
        new xdr.OperationMeta({
          changes: [
            xdr.LedgerEntryChange.ledgerEntryState(payBefore),
            xdr.LedgerEntryChange.ledgerEntryUpdated(payAfter),
            xdr.LedgerEntryChange.ledgerEntryState(destBefore),
            xdr.LedgerEntryChange.ledgerEntryUpdated(destAfter)
          ]
        })
      ]
    }),
    networkPassphrase: PASSPHRASE
  };
})();

/** Meta v3 variant of the normal payment. */
export const metaV3Payment = (() => {
  const feeBefore = makeAccountEntry(source, "1000000100", SEQUENCE);
  const feeAfter = makeAccountEntry(source, "1000000000", SEQUENCE);
  const sourceBefore = makeAccountEntry(source, "1000000000", SEQUENCE);
  const sourceAfter = makeAccountEntry(source, "900000000", "4370426197114881");
  const destBefore = makeAccountEntry(destination, "0", "1");
  const destAfter = makeAccountEntry(destination, "100000000", "1");

  return {
    envelopeXdr: paymentEnvelope(),
    resultXdr: encodeResult("100"),
    metaXdr: encodeMeta(3, {
      txBefore: [
        xdr.LedgerEntryChange.ledgerEntryState(feeBefore),
        xdr.LedgerEntryChange.ledgerEntryUpdated(feeAfter)
      ],
      operations: [
        new xdr.OperationMeta({
          changes: [
            xdr.LedgerEntryChange.ledgerEntryState(sourceBefore),
            xdr.LedgerEntryChange.ledgerEntryUpdated(sourceAfter),
            xdr.LedgerEntryChange.ledgerEntryState(destBefore),
            xdr.LedgerEntryChange.ledgerEntryUpdated(destAfter)
          ]
        })
      ]
    }),
    networkPassphrase: PASSPHRASE
  };
})();

export const secretSeed = source.secret();

export const notBase64 = "this is definitely not base64!!";

export const notMetaXdr = Buffer.alloc(32, 7).toString("base64");

/** Type-only export so fee-bump fixtures stay usable without runtime import. */
export type FeeBumpShape = FeeBumpTransaction;

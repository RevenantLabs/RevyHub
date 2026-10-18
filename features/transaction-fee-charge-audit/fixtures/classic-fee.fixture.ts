import {
  Account,
  Asset,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder
} from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const sourceAccount = seed(11).publicKey();
export const destinationAccount = seed(12).publicKey();
export const feeSourceAccount = seed(13).publicKey();

export const classicHash = "a".repeat(64);
export const feeBumpHash = "b".repeat(64);
export const missingHash = "c".repeat(64);
export const malformedFeeHash = "d".repeat(64);
export const missingLedgerHash = "e".repeat(64);

export const CLASSIC_LEDGER = 1_017_696;
export const FEE_BUMP_LEDGER = 1_017_700;
export const MISSING_LEDGER = 9_999_999;

const INNER_SEQUENCE = "4370426197114880";

function buildClassicTransaction() {
  const tx = new TransactionBuilder(new Account(sourceAccount, INNER_SEQUENCE), {
    fee: "10000",
    networkPassphrase: Networks.TESTNET,
    timebounds: { minTime: 1_700_000_000, maxTime: 1_900_000_000 }
  })
    .addOperation(
      Operation.payment({
        destination: destinationAccount,
        asset: Asset.native(),
        amount: "1"
      })
    )
    .addOperation(Operation.bumpSequence({ bumpTo: "4370426197120000" }))
    .addMemo(Memo.text("classic-fee"))
    .build();

  tx.sign(seed(11));
  return tx;
}

function buildFeeBumpTransaction() {
  const inner = new TransactionBuilder(new Account(sourceAccount, INNER_SEQUENCE), {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    timebounds: { minTime: 1_700_000_000, maxTime: 1_900_000_000 }
  })
    .addOperation(
      Operation.payment({
        destination: destinationAccount,
        asset: Asset.native(),
        amount: "2"
      })
    )
    .addMemo(Memo.text("fee-bump-charge"))
    .build();

  inner.sign(seed(11));

  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    seed(13),
    "2000",
    inner,
    Networks.TESTNET
  );
  feeBump.sign(seed(13));
  return { feeBump, inner };
}

export const classicTransactionXdr = buildClassicTransaction().toXDR();
export const { feeBump: feeBumpTransaction, inner: feeBumpInnerTransaction } =
  buildFeeBumpTransaction();
export const feeBumpEnvelopeXdr = feeBumpTransaction.toXDR();
export const feeBumpInnerFee = feeBumpInnerTransaction.fee;
export const feeBumpOuterMaxFee = feeBumpTransaction.fee;

export const classicLedgerRecord = {
  sequence: CLASSIC_LEDGER,
  closed_at: "2026-05-02T10:14:05Z",
  base_fee_in_stroops: "100",
  base_reserve_in_stroops: "5000000",
  successful_transaction_count: 40,
  failed_transaction_count: 2,
  operation_count: 80,
  protocol_version: 22
};

export const feeBumpLedgerRecord = {
  ...classicLedgerRecord,
  sequence: FEE_BUMP_LEDGER,
  closed_at: "2026-05-02T11:00:00Z",
  base_fee_in_stroops: "100"
};

/** Deterministic classic Horizon transaction with offered > charged. */
export const classicHorizonTransaction = {
  hash: classicHash,
  ledger: CLASSIC_LEDGER,
  successful: true,
  source_account: sourceAccount,
  fee_charged: "200",
  max_fee: "10000",
  operation_count: 2,
  created_at: "2026-05-02T10:14:05Z",
  memo_type: "text",
  memo: "classic-fee",
  envelope_xdr: classicTransactionXdr,
  _links: { self: { href: "" } },
  paging_token: "1",
  id: classicHash,
  result_xdr: "",
  result_meta_xdr: "",
  fee_meta_xdr: "",
  signatures: []
};

/** Deterministic fee-bump Horizon transaction — outer pays, inner fee separate. */
export const feeBumpHorizonTransaction = {
  hash: feeBumpHash,
  ledger: FEE_BUMP_LEDGER,
  successful: true,
  source_account: sourceAccount,
  fee_account: feeSourceAccount,
  fee_charged: "300",
  max_fee: feeBumpOuterMaxFee,
  operation_count: 1,
  created_at: "2026-05-02T11:00:00Z",
  memo_type: "text",
  memo: "fee-bump-charge",
  envelope_xdr: feeBumpEnvelopeXdr,
  inner_transaction: {
    max_fee: feeBumpInnerFee,
    fee_charged: feeBumpInnerFee,
    source_account: sourceAccount
  },
  _links: { self: { href: "" } },
  paging_token: "2",
  id: feeBumpHash,
  result_xdr: "",
  result_meta_xdr: "",
  fee_meta_xdr: "",
  signatures: []
};

/** Fee fields present but not parseable as stroops. */
export const malformedFeeHorizonTransaction = {
  ...classicHorizonTransaction,
  hash: malformedFeeHash,
  id: malformedFeeHash,
  max_fee: "not-a-number",
  fee_charged: "200"
};

/** Transaction whose referenced ledger is missing from Horizon. */
export const missingLedgerHorizonTransaction = {
  ...classicHorizonTransaction,
  hash: missingLedgerHash,
  id: missingLedgerHash,
  ledger: MISSING_LEDGER
};

export const classicAuditResult = {
  hash: classicHash,
  network: "testnet" as const,
  operationCount: 2,
  ledger: {
    sequence: CLASSIC_LEDGER,
    closedAt: "2026-05-02T10:14:05.000Z",
    baseFeeInStroops: "100"
  },
  envelope: {
    kind: "classic" as const,
    sourceAccount,
    fees: {
      maxFee: "10000",
      feeCharged: "200",
      difference: "9800"
    }
  }
};

export const feeBumpAuditResult = {
  hash: feeBumpHash,
  network: "testnet" as const,
  operationCount: 1,
  ledger: {
    sequence: FEE_BUMP_LEDGER,
    closedAt: "2026-05-02T11:00:00.000Z",
    baseFeeInStroops: "100"
  },
  envelope: {
    kind: "fee_bump" as const,
    outerFeeSource: feeSourceAccount,
    innerSourceAccount: sourceAccount,
    fees: {
      maxFee: feeBumpOuterMaxFee,
      feeCharged: "300",
      difference: (BigInt(feeBumpOuterMaxFee) - 300n).toString()
    },
    innerFee: feeBumpInnerFee
  }
};

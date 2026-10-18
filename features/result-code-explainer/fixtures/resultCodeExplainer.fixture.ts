import { xdr } from "@stellar/stellar-sdk";
import type { ResultCodeExplainerResult } from "@/features/result-code-explainer/types";

/** SDK typings omit the v0 discriminator; runtime accepts literal 0. */
function emptyResultExt(): xdr.TransactionResultExt {
  return new (xdr.TransactionResultExt as unknown as new (v: 0) => xdr.TransactionResultExt)(0);
}

function buildFailedPaymentResultXdr(): string {
  const paymentResult = xdr.PaymentResult.paymentUnderfunded();
  const tr = xdr.OperationResultTr.payment(paymentResult);
  const opResult = xdr.OperationResult.opInner(tr);

  const txResult = new xdr.TransactionResult({
    feeCharged: xdr.Int64.fromString("100"),
    result: xdr.TransactionResultResult.txFailed([opResult]),
    ext: emptyResultExt()
  });

  return txResult.toXDR("base64");
}

function buildBadSequenceResultXdr(): string {
  const txResult = new xdr.TransactionResult({
    feeCharged: xdr.Int64.fromString("100"),
    result: xdr.TransactionResultResult.txBadSeq(),
    ext: emptyResultExt()
  });

  return txResult.toXDR("base64");
}

/**
 * Result XDR is built with the SDK rather than hard-coded base64 so every
 * fixture is genuinely well-formed and identical on every machine.
 */
export const failedPaymentResultXdr = buildFailedPaymentResultXdr();
export const badSequenceResultXdr = buildBadSequenceResultXdr();

export const notBase64 = "tx_failed!!!";

export const resultCodeExplainerFixture: ResultCodeExplainerResult = {
  mode: "code",
  feeCharged: null,
  transactionCode: null,
  transactionExplanation: null,
  operations: [],
  explanations: [
    {
      code: "payment_underfunded",
      category: "operation",
      operationType: "payment",
      title: "Payment source lacks balance",
      cause: "The paying account does not hold enough of the asset being sent.",
      fix: "Check the source account balance for that asset (XLM or trustline) and lower the amount or fund the account.",
      known: true
    }
  ],
  searchQuery: "",
  unknownCodes: []
};

export const decodedFailedPaymentFixture: ResultCodeExplainerResult = {
  mode: "xdr",
  feeCharged: "100",
  transactionCode: "tx_failed",
  transactionExplanation: {
    code: "tx_failed",
    category: "transaction",
    title: "Transaction failed",
    cause: "At least one operation failed. Earlier operations may still have applied; later ones were skipped.",
    fix: "Read the operation-level codes below, fix the failing step, rebuild the transaction, and submit again.",
    known: true
  },
  operations: [
    {
      index: 0,
      operationType: "payment",
      outerCode: "op_inner",
      innerCode: "payment_underfunded",
      explanations: [
        {
          code: "payment_underfunded",
          category: "operation",
          operationType: "payment",
          title: "Payment source lacks balance",
          cause: "The paying account does not hold enough of the asset being sent.",
          fix: "Check the source account balance for that asset (XLM or trustline) and lower the amount or fund the account.",
          known: true
        }
      ]
    }
  ],
  explanations: [],
  searchQuery: "",
  unknownCodes: []
};

decodedFailedPaymentFixture.explanations = [
  decodedFailedPaymentFixture.transactionExplanation!,
  ...decodedFailedPaymentFixture.operations.flatMap((op) => op.explanations)
];

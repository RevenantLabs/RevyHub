import { FeeBumpTransaction, Transaction, xdr } from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASES } from "@/core/network/config";
import type { StellarNetwork } from "@/core/network/types";
import { err, ok, type Result } from "@/core/result/result";
import { computeStroopDifference, parseStroopAmount } from "@/features/transaction-fee-charge-audit/lib/stroop-difference";
import type {
  EnvelopeAudit,
  EnvelopeKind,
  HorizonTransactionRecord,
  TransactionFeeChargeAuditErrorCode
} from "@/features/transaction-fee-charge-audit/types";

export type EnvelopeIdentity =
  | { kind: "classic" }
  | { kind: "fee_bump"; outerFeeSource: string; innerSourceAccount: string; innerFee: string }
  | { kind: "unsupported" };

/**
 * Identifies classic versus fee-bump from the settled envelope XDR when
 * present, falling back to Horizon's `fee_account` field.
 */
export function identifyEnvelope(
  transaction: HorizonTransactionRecord,
  network: StellarNetwork
): EnvelopeIdentity {
  const envelopeXdr = transaction.envelope_xdr?.trim();

  if (envelopeXdr) {
    try {
      const decoded = xdr.TransactionEnvelope.fromXDR(envelopeXdr, "base64");
      const variant = decoded.switch().name;

      if (variant === "envelopeTypeTx" || variant === "envelopeTypeTxV0") {
        return { kind: "classic" };
      }

      if (variant === "envelopeTypeTxFeeBump") {
        const passphrase = NETWORK_PASSPHRASES[network];
        const feeBump = new FeeBumpTransaction(decoded, passphrase);
        const inner = feeBump.innerTransaction as Transaction;

        return {
          kind: "fee_bump",
          outerFeeSource: feeBump.feeSource,
          innerSourceAccount: inner.source,
          innerFee: inner.fee
        };
      }

      return { kind: "unsupported" };
    } catch {
      // Fall through to Horizon metadata when XDR cannot be decoded.
    }
  }

  const feeAccount = transaction.fee_account?.trim();
  if (feeAccount && feeAccount !== transaction.source_account) {
    const innerFee =
      parseStroopAmount(transaction.inner_transaction?.max_fee) ??
      parseStroopAmount(transaction.inner_transaction?.fee_charged);

    if (!innerFee) {
      return { kind: "unsupported" };
    }

    return {
      kind: "fee_bump",
      outerFeeSource: feeAccount,
      innerSourceAccount: transaction.source_account,
      innerFee
    };
  }

  if (transaction.source_account) {
    return { kind: "classic" };
  }

  return { kind: "unsupported" };
}

/**
 * Normalises classic and fee-bump fee fields into a single envelope audit.
 * Malformed or absent fee amounts become `invalid_fee_data` — an incomplete audit.
 */
export function normalizeFeeFields(
  transaction: HorizonTransactionRecord,
  network: StellarNetwork
): Result<EnvelopeAudit, TransactionFeeChargeAuditErrorCode> {
  const identity = identifyEnvelope(transaction, network);

  if (identity.kind === "unsupported") {
    return err("unsupported_envelope");
  }

  const fees = computeStroopDifference(transaction.max_fee, transaction.fee_charged);
  if (!fees.ok) {
    return err("invalid_fee_data");
  }

  if (identity.kind === "classic") {
    if (!transaction.source_account) {
      return err("invalid_fee_data");
    }

    return ok({
      kind: "classic",
      sourceAccount: transaction.source_account,
      fees: fees.value
    });
  }

  const innerFee = parseStroopAmount(identity.innerFee);
  if (innerFee === null) {
    return err("invalid_fee_data");
  }

  return ok({
    kind: "fee_bump",
    outerFeeSource: identity.outerFeeSource,
    innerSourceAccount: identity.innerSourceAccount,
    fees: fees.value,
    innerFee
  });
}

export function envelopeKindOf(audit: EnvelopeAudit): EnvelopeKind {
  return audit.kind;
}

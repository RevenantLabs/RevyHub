import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { linkOperationsToEffects } from "@/features/payment-receipt-reconciler/lib/effect-links";
import { sumReceiptAmounts } from "@/features/payment-receipt-reconciler/lib/receipt-amounts";
import { fetchReceiptBundle } from "@/features/payment-receipt-reconciler/lib/receipt-fetch";
import type {
  PaymentReceipt,
  PaymentReceiptReconcilerErrorCode,
  PaymentReceiptReconcilerInput
} from "@/features/payment-receipt-reconciler/types";

/**
 * Orchestrates Horizon fetches, effect linking and amount totals into one
 * Result-based payment receipt.
 */
export async function runPaymentReceiptReconciler(
  input: PaymentReceiptReconcilerInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<PaymentReceipt, PaymentReceiptReconcilerErrorCode>> {
  const bundle = await fetchReceiptBundle(input.hash, network, signal);
  if (!bundle.ok) return bundle;

  const { transaction, operations, effects } = bundle.value;

  if (!transaction.successful) return err("transaction_failed");

  const linked = linkOperationsToEffects(operations, effects);
  if (!linked.ok) return linked;

  const feeCharged = String(transaction.fee_charged);
  const totals = sumReceiptAmounts(linked.value.links, feeCharged);

  return ok({
    hash: transaction.hash,
    network,
    ledger: transaction.ledger,
    createdAt: transaction.created_at,
    sourceAccount: transaction.source_account,
    feeCharged,
    operations: linked.value.operations,
    links: linked.value.links,
    totals,
    outside: linked.value.outside,
    publicReceipt: {
      hash: transaction.hash,
      network,
      ledger: transaction.ledger
    }
  });
}

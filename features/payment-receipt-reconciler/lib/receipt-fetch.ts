import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toPaymentReceiptReconcilerErrorCode } from "@/features/payment-receipt-reconciler/lib/paymentReceiptReconciler.errors";
import type {
  PaymentReceiptReconcilerErrorCode,
  ReceiptAsset
} from "@/features/payment-receipt-reconciler/types";

export interface RawHorizonTransaction {
  hash: string;
  ledger: number;
  successful: boolean;
  source_account: string;
  fee_charged: string | number;
  created_at: string;
  operation_count: number;
}

export interface RawHorizonOperation {
  id: string;
  type: string;
  source_account: string;
  from?: string;
  to?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  source_amount?: string;
  source_asset_type?: string;
  source_asset_code?: string;
  source_asset_issuer?: string;
}

export interface RawHorizonEffect {
  id: string;
  type: string;
  account?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
}

interface Collection<T> {
  _embedded?: { records?: T[] };
}

export interface ReceiptBundle {
  transaction: RawHorizonTransaction;
  operations: RawHorizonOperation[];
  effects: RawHorizonEffect[];
}

export function parseReceiptAsset(
  assetType?: string,
  assetCode?: string,
  assetIssuer?: string
): ReceiptAsset | null {
  if (assetType === "native") return { type: "native" };
  if (assetType && assetCode && assetIssuer) {
    return { type: "credit", code: assetCode, issuer: assetIssuer };
  }
  return null;
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw Object.assign(new Error("Horizon request failed."), { status: response.status });
  }

  return (await response.json()) as T;
}

/**
 * Fetches a transaction together with its operations and effects pages.
 *
 * All three endpoints are required for reconciliation — a partial response
 * maps to `request_failed` rather than a half-built receipt.
 */
export async function fetchReceiptBundle(
  hash: string,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<ReceiptBundle, PaymentReceiptReconcilerErrorCode>> {
  try {
    const transaction = await requestJson<RawHorizonTransaction>(
      horizonUrl(network, `/transactions/${encodeURIComponent(hash)}`),
      signal
    );

    const [operationsPage, effectsPage] = await Promise.all([
      requestJson<Collection<RawHorizonOperation>>(
        horizonUrl(network, `/transactions/${encodeURIComponent(hash)}/operations`, {
          limit: 200,
          order: "asc"
        }),
        signal
      ),
      requestJson<Collection<RawHorizonEffect>>(
        horizonUrl(network, `/transactions/${encodeURIComponent(hash)}/effects`, {
          limit: 200,
          order: "asc"
        }),
        signal
      )
    ]);

    return ok({
      transaction,
      operations: operationsPage._embedded?.records ?? [],
      effects: effectsPage._embedded?.records ?? []
    });
  } catch (error) {
    return err(toPaymentReceiptReconcilerErrorCode(error));
  }
}

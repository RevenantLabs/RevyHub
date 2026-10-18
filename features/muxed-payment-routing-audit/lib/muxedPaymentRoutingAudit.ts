import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseMuxedPaymentRoutingAuditInput } from "@/features/muxed-payment-routing-audit/schema";
import { fetchPaymentPages, MAX_PAGES } from "@/features/muxed-payment-routing-audit/lib/payment-pages";
import { normalizeMuxedDestination } from "@/features/muxed-payment-routing-audit/lib/muxed-destination";
import { routingTotals } from "@/features/muxed-payment-routing-audit/lib/routing-totals";
import { amountToStroops } from "@/features/muxed-payment-routing-audit/lib/format";
import type { MuxedPaymentRoutingAuditInput, MuxedPaymentRoutingAuditResult, MuxedPaymentRoutingAuditErrorCode, RoutedPayment } from "@/features/muxed-payment-routing-audit/types";

/** Expected failures are values; no partial totals are shown for a bad page. */
export async function runMuxedPaymentRoutingAudit(input: MuxedPaymentRoutingAuditInput, network: StellarNetwork, signal?: AbortSignal): Promise<Result<MuxedPaymentRoutingAuditResult, MuxedPaymentRoutingAuditErrorCode>> {
  const validated = parseMuxedPaymentRoutingAuditInput(input.accountId);
  if (!validated.ok) return validated;
  const pages = await fetchPaymentPages(validated.value.accountId, network, signal);
  if (!pages.ok) return pages;
  const payments: RoutedPayment[] = [];
  for (const record of pages.value.records) {
    // Horizon's payments collection also carries operations without a fixed amount.
    if (!["payment", "path_payment_strict_receive", "path_payment_strict_send", "create_account"].includes(record.type)) continue;
    const destination = normalizeMuxedDestination(record, validated.value.accountId);
    if (!destination.ok) return destination;
    if (destination.value === undefined) continue; // outgoing or unrelated route
    const amount = record.type === "create_account" ? record.starting_balance : record.amount;
    const assetType = record.type === "create_account" ? "native" : record.asset_type;
    const code = assetType === "native" ? "XLM" : record.asset_code;
    const issuer = assetType === "native" ? null : record.asset_issuer;
    if (typeof amount !== "string" || amountToStroops(amount) === null ||
        (assetType !== "native" && (assetType !== "credit_alphanum4" && assetType !== "credit_alphanum12" || typeof code !== "string" || !/^[A-Za-z0-9]{1,12}$/.test(code) || typeof issuer !== "string" || !StrKey.isValidEd25519PublicKey(issuer))) ||
        typeof record.created_at !== "string" || Number.isNaN(Date.parse(record.created_at)) || typeof record.transaction_hash !== "string") return err("malformed_payment");
    payments.push({ pagingToken: record.paging_token, createdAt: record.created_at, transactionHash: record.transaction_hash, destinationId: destination.value, amount, assetCode: code as string, assetIssuer: issuer as string | null });
  }
  return ok({ accountId: validated.value.accountId, network, pagesFetched: pages.value.pagesFetched, pageLimit: MAX_PAGES, hasMore: pages.value.hasMore, scannedOperations: pages.value.records.length, groups: routingTotals(payments) });
}

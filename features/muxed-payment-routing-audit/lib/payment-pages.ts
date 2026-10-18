import { horizonUrl } from "@/core/horizon/client";
import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { toMuxedPaymentRoutingAuditErrorCode } from "@/features/muxed-payment-routing-audit/lib/muxedPaymentRoutingAudit.errors";
import type { MuxedPaymentRoutingAuditErrorCode } from "@/features/muxed-payment-routing-audit/types";

export const PAGE_SIZE = 20;
export const MAX_PAGES = 3;
export interface RawPayment extends Record<string, unknown> { paging_token: string; type: string }
export interface PaymentPages { records: RawPayment[]; pagesFetched: number; hasMore: boolean }

/** Fetches at most three descending Horizon pages, rejecting broken or repeated cursors. */
export async function fetchPaymentPages(accountId: string, network: StellarNetwork, signal?: AbortSignal): Promise<Result<PaymentPages, MuxedPaymentRoutingAuditErrorCode>> {
  const records: RawPayment[] = [];
  const seen = new Set<string>();
  let previousToken: string | undefined;
  let cursor: string | undefined;
  let pagesFetched = 0;
  let hasMore = false;
  try {
    for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
      const response = await fetch(horizonUrl(network, `/accounts/${accountId}/payments`, { order: "desc", limit: PAGE_SIZE, cursor }), { signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw Object.assign(new Error("Horizon payment page failed"), { status: response.status });
      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || !("_embedded" in body) || !body._embedded || typeof body._embedded !== "object" || !("records" in body._embedded) || !Array.isArray(body._embedded.records)) return err("malformed_payment");
      const page = body._embedded.records as unknown[];
      if (page.length > PAGE_SIZE) return err("malformed_payment");
      pagesFetched++;
      for (const record of page) {
        if (!record || typeof record !== "object" || !("paging_token" in record) || typeof record.paging_token !== "string" || !/^\d+$/.test(record.paging_token)) return err("invalid_cursor");
        if (!("type" in record) || typeof record.type !== "string") return err("malformed_payment");
        if (seen.has(record.paging_token) || (previousToken !== undefined && BigInt(record.paging_token) >= BigInt(previousToken))) return err("invalid_cursor");
        seen.add(record.paging_token);
        previousToken = record.paging_token;
        records.push(record as RawPayment);
      }
      hasMore = page.length === PAGE_SIZE;
      if (!hasMore) break;
      const last = records.at(-1)!.paging_token;
      if (last === cursor) return err("invalid_cursor");
      cursor = last;
    }
    return ok({ records, pagesFetched, hasMore });
  } catch (error) { return err(toMuxedPaymentRoutingAuditErrorCode(error)); }
}

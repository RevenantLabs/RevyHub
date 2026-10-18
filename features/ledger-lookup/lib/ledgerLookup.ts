import { horizonUrl } from "@/core/horizon/client";
import { runHorizonRequest } from "@/core/horizon/request";
import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { toLedgerLookupErrorCode } from "./ledgerLookup.errors";
import type { LedgerLookupInput, LedgerLookupResult, LedgerLookupErrorCode } from "../types";
const count = (n: unknown): number | null => typeof n === "number" && Number.isSafeInteger(n) && n >= 0 ? n : null;
const amount = (n: unknown): string | null => typeof n === "string" && /^\d+(\.\d{1,7})?$/.test(n) ? n : null;
const stroops = (n: unknown): string | null => typeof n === "string" && /^\d+$/.test(n) ? n : count(n) !== null ? String(n) : null;
export async function runLedgerLookup(input: LedgerLookupInput, network: StellarNetwork, signal?: AbortSignal): Promise<Result<LedgerLookupResult, LedgerLookupErrorCode>> {
 try {
  const read = async (path: string): Promise<Record<string, unknown>> => {
   const response = await fetch(horizonUrl(network, path), {signal});
   if (!response.ok) throw {status: response.status};
   const body: unknown = await response.json();
   if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid response");
   return body as Record<string, unknown>;
  };
  const root = await runHorizonRequest(read("/"), {signal});
  const height = count(root.history_latest_ledger); const elder = count(root.history_elder_ledger);
  if (height === null) return err("request_failed");
  if (input.sequence > height) return err("future_ledger", {currentHeight: height});
  if (elder !== null && input.sequence < elder) return err("ledger_not_found");
  const ledger = await runHorizonRequest(read(`/ledgers/${input.sequence}`), {signal});
  if (ledger.sequence !== input.sequence || typeof ledger.closed_at !== "string" || !Number.isFinite(Date.parse(ledger.closed_at))) return err("request_failed");
  return ok({sequence: ledger.sequence, closedAt: new Date(ledger.closed_at).toISOString(), observedAt: new Date().toISOString(),
   successful: count(ledger.successful_transaction_count), failed: count(ledger.failed_transaction_count), operations: count(ledger.operation_count),
   feePool: amount(ledger.fee_pool), totalCoins: amount(ledger.total_coins), baseFee: stroops(ledger.base_fee_in_stroops), baseReserve: stroops(ledger.base_reserve_in_stroops), protocol: count(ledger.protocol_version)});
 } catch (error) {return err(toLedgerLookupErrorCode(error));}
}

import { horizonUrl } from "@/core/horizon/client";
import { StrKey } from "@stellar/stellar-sdk";
import type { StellarNetwork } from "@/core/network/types";
import type { AccountRow, AssetBalance } from "../types";
import { toMultiAccountAssetExposureErrorCode } from "./multiAccountAssetExposure.errors";
import { toStroops } from "./format";
export const MAX_CONCURRENT_ACCOUNTS = 3;

function decodeBalances(payload: unknown): AssetBalance[] {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { balances?: unknown }).balances)) {
    throw new Error("Invalid account response");
  }
  return (payload as { balances: unknown[] }).balances.flatMap((line): AssetBalance[] => {
    if (!line || typeof line !== "object") throw new Error("Invalid balance line");
    const data = line as Record<string, unknown>;
    if (data.asset_type === "liquidity_pool_shares") return [];
    if (typeof data.balance !== "string") throw new Error("Missing balance");
    toStroops(data.balance);
    if (data.asset_type === "native") return [{ kind: "native", code: "XLM", issuer: "", balance: data.balance }];
    if ((data.asset_type === "credit_alphanum4" || data.asset_type === "credit_alphanum12") &&
        typeof data.asset_code === "string" && /^[A-Za-z0-9]{1,12}$/.test(data.asset_code) &&
        typeof data.asset_issuer === "string" && StrKey.isValidEd25519PublicKey(data.asset_issuer)) {
      return [{ kind: "credit", code: data.asset_code, issuer: data.asset_issuer, balance: data.balance }];
    }
    throw new Error("Invalid asset identity");
  });
}
async function loadOne(accountId: string, network: StellarNetwork, signal?: AbortSignal): Promise<AccountRow> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetch(horizonUrl(network, `/accounts/${accountId}`), {
      signal: controller.signal, headers: { Accept: "application/json" }
    });
    if (!response.ok) throw { status: response.status };
    return { accountId, status: "success", balances: decodeBalances(await response.json()) };
  } catch (error) {
    return { accountId, status: "error", code: toMultiAccountAssetExposureErrorCode(error) };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
/** Fixed-size worker pool; result positions always follow input order. */
export async function fetchAccountBatch(accountIds: string[], network: StellarNetwork, signal?: AbortSignal): Promise<AccountRow[]> {
  const rows: AccountRow[] = new Array(accountIds.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_ACCOUNTS, accountIds.length) }, async () => {
    while (next < accountIds.length && !signal?.aborted) {
      const index = next++;
      rows[index] = await loadOne(accountIds[index], network, signal);
    }
  }));
  return rows;
}

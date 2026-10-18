import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toClaimableBalancesErrorCode } from "@/features/claimable-balances/lib/claimableBalances.errors";
import {
  describePredicate,
  isPredicateClaimableNow,
  type HorizonPredicate
} from "@/features/claimable-balances/lib/predicate";
import type {
  ClaimableBalanceAsset,
  ClaimableBalanceSummary,
  ClaimableBalancesErrorCode,
  ClaimableBalancesInput,
  ClaimableBalancesResult,
  TranslatedClaimant
} from "@/features/claimable-balances/types";

const PAGE_SIZE = 200;

export interface RawClaimant {
  destination: string;
  predicate: HorizonPredicate;
}

export interface RawClaimableBalance {
  id: string;
  asset: string;
  amount: string;
  sponsor?: string;
  last_modified_ledger: number;
  last_modified_time?: string;
  claimants: RawClaimant[];
  paging_token?: string;
}

interface CollectionPage {
  _embedded: { records: RawClaimableBalance[] };
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw Object.assign(new Error("Horizon request failed."), { status: response.status });
  }

  return (await response.json()) as T;
}

async function collectByClaimant(
  network: StellarNetwork,
  accountId: string,
  signal?: AbortSignal
): Promise<RawClaimableBalance[]> {
  const records: RawClaimableBalance[] = [];
  let cursor: string | undefined;

  while (true) {
    const page = await requestJson<CollectionPage>(
      horizonUrl(network, "/claimable_balances", {
        claimant: accountId,
        cursor,
        limit: PAGE_SIZE,
        order: "asc"
      }),
      signal
    );

    const nextRecords = page._embedded.records;
    records.push(...nextRecords);

    if (nextRecords.length < PAGE_SIZE) return records;

    const nextCursor = nextRecords.at(-1)?.paging_token;
    if (!nextCursor || nextCursor === cursor) {
      throw new Error("Horizon pagination did not advance.");
    }
    cursor = nextCursor;
  }
}

export function parseAsset(asset: string): ClaimableBalanceAsset {
  if (asset === "native") {
    return { kind: "native", label: "XLM (native)" };
  }

  const [assetCode, assetIssuer] = asset.split(":");
  return {
    kind: "credit",
    assetCode: assetCode ?? asset,
    assetIssuer,
    label: assetIssuer ? `${assetCode}:${assetIssuer}` : asset
  };
}

function fundedAtMs(record: RawClaimableBalance): number {
  const parsed = record.last_modified_time ? Date.parse(record.last_modified_time) : Number.NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function translateClaimant(
  claimant: RawClaimant,
  fundedAt: string,
  nowMs = Date.now()
): TranslatedClaimant {
  const fundedAtMsValue = Date.parse(fundedAt);
  const context = {
    fundedAtMs: Number.isNaN(fundedAtMsValue) ? 0 : fundedAtMsValue,
    nowMs
  };

  return {
    destination: claimant.destination,
    predicateText: describePredicate(claimant.predicate),
    claimableNow: isPredicateClaimableNow(claimant.predicate, context)
  };
}

export function normalizeClaimableBalance(
  record: RawClaimableBalance,
  nowMs = Date.now()
): ClaimableBalanceSummary {
  const fundedAt =
    record.last_modified_time ?? new Date(nowMs).toISOString().replace(".000Z", "Z");

  return {
    id: record.id,
    amount: record.amount,
    asset: parseAsset(record.asset),
    sponsor: record.sponsor,
    lastModifiedLedger: record.last_modified_ledger,
    fundedAt,
    claimants: record.claimants.map((claimant) => translateClaimant(claimant, fundedAt, nowMs))
  };
}

export async function runClaimableBalances(
  input: ClaimableBalancesInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<ClaimableBalancesResult, ClaimableBalancesErrorCode>> {
  try {
    if (input.mode === "account") {
      const records = await collectByClaimant(network, input.accountId, signal);
      return ok({
        mode: "account",
        query: input.accountId,
        balances: records.map((record) => normalizeClaimableBalance(record))
      });
    }

    const record = await requestJson<RawClaimableBalance>(
      horizonUrl(network, `/claimable_balances/${encodeURIComponent(input.balanceId)}`),
      signal
    );

    return ok({
      mode: "balance",
      query: input.balanceId,
      balances: [normalizeClaimableBalance(record)]
    });
  } catch (error) {
    return err(toClaimableBalancesErrorCode(error));
  }
}
